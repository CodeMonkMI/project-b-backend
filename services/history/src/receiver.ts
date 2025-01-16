const QUEUE_URL = "amqp://rabbitmq:5672";

import amqp from "amqplib";
import prisma from "./prisma";
import { CreateDonationHistoryDTO } from "./schemas";

const receiveFromQueue = async (
  queue: string,
  callback: (msg: string) => void
) => {
  try {
    // create connection
    const connection = await amqp.connect(QUEUE_URL);

    const channel = await connection.createChannel();

    const exchange = "request";
    await channel.assertExchange(exchange, "direct", { durable: true });

    const q = await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(q.queue, exchange, queue);

    channel.consume(q.queue, (msg) => {
      if (msg) callback(msg.content.toString());
    });
  } catch (error) {
    console.log("rabbit mq error", error);
  }
};

receiveFromQueue("request-handle-history", async (msg) => {
  try {
    // todo need to add type guard for safety
    const data: CreateDonationHistoryDTO = JSON.parse(msg);
    await prisma.donationHistory.create({
      data: {
        ...data,
      },
    });
    console.log(`RabQ: History Created for Request ${data.type}`);
  } catch (error) {
    console.log(`RabbitMQ Error: request-handle`, msg, error);
  }
});
