import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name:{
      type: String,
      required: true,
    },
    phone:{
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    status: { type: String, default: "PENDING" },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      },
    },
    paymentAmount: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
