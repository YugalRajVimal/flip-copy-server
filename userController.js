import crypto from "crypto";

import { Cashfree as CashfreePG } from "cashfree-pg";

CashfreePG.XClientId = process.env.CASHFREE_CLIENT_ID;
CashfreePG.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
CashfreePG.XEnvironment = CashfreePG.Environment.SANDBOX;

import SubscriptionModel from "./schemas/subscription.schema.js";

class UserController {
  // Function to generate the Cashfree Order ID
  generateOrderId = async () => {
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256");
    hash.update(uniqueId);
    return hash.digest("hex").slice(0, 12);
  };

  generateSessionId = async (req, res) => {
    console.log("1. Get Session ID Process Started");
    //getUserDetails

    const { name, email, phone,amount } = req.body;

    console.log("1. Email", email);

    try {
      const orderId = await this.generateOrderId();

      var paymentAmount = amount;

      console.log(paymentAmount);

      const subscription = new SubscriptionModel({
        name,
        phone,
        orderId,
        email: email,
        paymentAmount,
      });
      subscription.save();

      console.log("5. Subscription created", subscription);

      let request = {
        order_id: orderId,
        order_amount: paymentAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: `${name.replace(/\s/g, '')}${orderId}`,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
        },
      };

      console.log("6. Request Payload", request);

      const response = await CashfreePG.PGCreateOrder("2023-08-01", request);

      console.log("Request Completed with Status", response.status);
      console.log("Get Session ID Process Completed");
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error creating Cashfree order", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  handleWebhook = async (req, res) => {
    try {
      const order_id = req.body.data.order.order_id;
      const payment_status = req.body.data.payment.payment_status;
      const customer_id = req.body.data.customer_details.customer_id;

      // console.log("Order ID:", order_id);
      // console.log("Payment Status:", payment_status);
      // console.log("Customer ID:", customer_id);

      if (payment_status === "SUCCESS") {
        const subscription = await SubscriptionModel.findOneAndUpdate(
          { orderId: order_id },
          { status: "PAID" },
          { new: true }
        );
      } else {
        console.log(`Order ${order_id} payment status: ${order_status}`);
      }

      res.status(200).send("Webhook received successfully");
    } catch (error) {
      console.error("Error handling Cashfree webhook", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

export default UserController;
