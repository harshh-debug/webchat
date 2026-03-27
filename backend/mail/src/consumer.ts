import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const startSendOtpConsumer = async () => {
  while (true) {
    try {
      const connection = await amqp.connect({
        protocol: "amqp",
        hostname: process.env.RabbitMQ_HOSTNAME,
        port: 5672,
        username: process.env.RabbitMQ_USERNAME,
        password: process.env.RabbitMQ_PASSWORD,
      });

      const channel = await connection.createChannel();
      const queueName = "send-otp";

      await channel.assertQueue(queueName, { durable: true });
      channel.prefetch(1);

      console.log("✅ Mail service connected to RabbitMQ");

      channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            const { to, subject, body } = JSON.parse(msg.content.toString());

            const transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              auth: {
                user: process.env.MAIL_USER,
                pass: process.env.PASSWORD,
              },
            });

            await transporter.sendMail({
              from: "WebChat",
              to,
              subject,
              text: body,
            });

            console.log(`OTP mail sent to ${to}`);
            channel.ack(msg);
          } catch (error) {
            console.log("❌ Failed to send OTP", error);
            channel.nack(msg, false, false);
          }
        }
      });

      break; // ✅ exit loop when connected
    } catch (error) {
      console.log("❌ Consumer failed, retrying...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};