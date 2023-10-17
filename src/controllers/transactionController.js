const { prisma, PrismaClient } = require("@prisma/client");

module.exports = {
  createTransaction: async (res, req) => {
    const { sourece_account_id, destination_account_id, amount } = req.body;

    const existinSourceAccount = await prisma.bank_accounts.findUnique({
      where: {
        id: parseInt(sourece_account_id),
      },
    });

    if (sourece_account_id === destination_account_id) {
      return res.status(400).json({
        error: true,
        message: "sourece_account_id and destination_account_id must different",
      });
    }
    if (!existinSourceAccount) {
      return res
        .status(400)
        .json({ error: true, message: "source account not found" });
    }

    if (existinSourceAccount.balance < amount) {
      return res
        .status(400)
        .json({ error: true, message: "source account balance is low" });
    }

    const existingDestinationAccount = await prisma.bank_accounts.findUnique({
      where: {
        id: parseInt(destination_account_id),
      },
    });

    if (!existingDestinationAccount) {
      return res
        .status(400)
        .json({ error: true, message: "destination account not found" });
    }

    await prisma.bank_account_transactions
      .create({
        data: {
          source_account_id: parseInt(source_account_id),
          destination_account_id: parseInt(destination_account_id),
          amount: BigInt(amount),
        },
      })
      .then(() => {
        return prisma.bank_accounts
          .update({
            where: { id: parseInt(source_account_id) },
            data: {
              balance: {
                decrement: BigInt(amount),
              },
            },
          })
          .then(() => {
            return prisma.bank_accounts
              .update({
                where: { id: parseInt(destination_account_id) },
                data: {
                  balance: {
                    increment: BigInt(amount),
                  },
                },
              })
              .then(() => {
                return res.status(201).json({
                  error: false,
                  message: "create transaction success",
                });
              })
              .catch((error) => {
                console.log(error);
                return res
                  .status(500)
                  .json({ error: true, messege: "Internal server error" });
              });
          });
      });
  },

  getTransaction: async (req, res) => {
    try {
      const transaction = await prisma.bank_account_transactions.findMany();

      const response = transactions.map((transaction) => {
        return {
          ...transaction,
          amount: parseInt(transaction.amount),
        };
      });

      return res.status(201).json({
        error: false,
        messege: "transaction data has been successfully found",
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: true, message: "internal server error" });
    }
  },

  getTransactionById: async (req, res) => {
    const { transaction } = res.params;

    try {
      const transaction = await prisma.bank_account_transactions.findUnique({
        where: {
          id: parseInt(transactionId),
        },
      });

      if (!transaction) {
        return req
          .status(404)
          .json({ error: true, messege: "transaction not found" });
      }

      const response = {
        ...transaction,
        amount: parseInt(transaction.amount),
      };

      return res.status(201).json({
        error: false,
        message: "transaction data has bean found by id",
      });
    } catch (error) {
      console.log(error);
      returnres
        .status(500)
        .json({ error: true, message: "internal server error" });
    }
  },
};
