import amqp from "amqplib";
import prisma from "./prisma";
import { NotificationDTO } from "./schemas";

const QUEUE_URL = "amqp://rabbitmq:5672";

const receiveFromQueue = async (
  queue: string,
  callback: (msg: string) => void
) => {
  try {
    // create connection
    const connection = await amqp.connect(QUEUE_URL);

    // create channel
    const channel = await connection.createChannel();

    // assert exchange
    const exchange = "auth";
    await channel.assertExchange(exchange, "direct", { durable: true });

    // assert and bind queue
    const q = await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(q.queue, (msg) => {
      if (msg) callback(msg.content.toString());
    });
    setTimeout(() => {
      connection.close();
    }, 1000);
  } catch (error) {
    console.log("rabbit mq error", error);
  }
};

receiveFromQueue("auth-signup", async (msg) => {
  try {
    const data: NotificationDTO & {
      receiver: string[];
    } = JSON.parse(msg);
    const notifications: NotificationDTO[] = data.receiver.map((i) => ({
      type: data.type,
      message: data.message,
      receiver: i,
    }));
    await prisma.notification.createMany({
      data: notifications,
    });
    console.log(`RabQ: notification created for auth-signup`);
  } catch (error) {
    console.log(`RabbitMQ Error: auth-signup`, msg, error);
  }
});
