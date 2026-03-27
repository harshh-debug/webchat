import amql from "amqplib";

let channel: amql.Channel;

export const connectRabbitMQ = async () => {
	while (true) {
		try {
			const connection = await amql.connect({
				protocol: "amqp",
				hostname: process.env.RabbitMQ_HOSTNAME,
				port: 5672,
				username: process.env.RabbitMQ_USERNAME,
				password: process.env.RabbitMQ_PASSWORD,
			});

			channel = await connection.createChannel();

			console.log("✅ Connected to RabbitMQ");
			break;
		} catch (error) {
			console.log("❌ Failed to connect to RabbitMQ, retrying...");
			await new Promise((res) => setTimeout(res, 5000));
		}
	}
};

export const publishToQueue = async (queueName: string, message: any):Promise<void> => {
  if (!channel) {
    console.log("❌ Channel not ready, retrying...");
    await new Promise((res) => setTimeout(res, 2000));
    return publishToQueue(queueName, message);
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};
