const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  createAccount: async (req, res) => {
    const { bank_name, bank_account_number, balence, user_id } = req.body;

    try {
      const exitingUser = await prisma.users.findUnique({
        where: { id: parseInt(user_id) },
      });

      if (!exitingUser) {
        return res.status(400).json({ error: true, messege: "User not Found" });
      }

      if (balence < 50000) {
        return res
          .status(400)
          .json({ error: true, messege: "minimum balence is 50.000" });
      }

      const response = await prisma.bank_accounts.create({
        data: {
          bank_name: bank_name,
          bank_account_number: bank_account_number,
          balence: BigInt(balence),
          user: {
            connect: { id: parseInt(user_id) },
          },
        },
      });

      const balenceInt = parseInt(balence);

      return res.status(201).json({
        error: false,
        messege: "Create account success",
        data: {
          ...response,
          balence: balence,
        },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: true, messege: "internal server error" });
    }
  },

  getAccounts: async (req, res) => {
    try {
      const accounts = await prisma.bank_accounts.findMany();

      const response = accounts.map((account) => {
        return {
          ...account,
          balence: parseInt(account.balence),
        };
      });

      return res.status(201).json({
        error: false,
        messege: "Account data has been successfully found",
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: true, messege: " internal server error" });
    }
  },

  getAccountById: async (req, res) => {
    const { accountId } = req.params;

    try {
      const account = await prisma.bank_accounts.findUnique({
        where: {
          id: parseInt(accountId),
        },
      });

      if (!account) {
        return res
          .status(404)
          .json({ error: true, messege: "bank account not found" });
      }

      const response = {
        ...account,
        balence: parseInt(account.balence),
      };

      const transactions = await prisma.bank_account_transactions.findMany({
        where: {
          source_accound_id: parseInt(accountId),
        },
        take: 5,
        orderBy: {
          id: "desc",
        },
      });

      const historyTransaction = transactions.map((transaction) => {
        return {
          ...transaction,
          amount: parseInt(transaction.amount),
        };
      });

      return res.status(201).json({
        error: false,
        messege: "Account data has been successfully found by id",
        data: response,
        latestTransaction: historyTransaction,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: true, messege: "internal server error" });
    }
  },
};
