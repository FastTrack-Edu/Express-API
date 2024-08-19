const express = require("express");
const auth = require("../middleware/auth.middleware");
const snap = require("../config/midtrans.config");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { order_id, gross_amount, item_name, item_price, customer_name, customer_email } = req.body;

  const parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: gross_amount,
    },
    item_details: {
      name: item_name,
      price: item_price,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: customer_name,
      email: customer_email,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error creating transaction",
      details: error.message,
    });
  }
});

module.exports = router;
