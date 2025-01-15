const QUEUE_URL = "amqp://rabbitmq:5672";

import amqp from "amqplib";

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

receiveFromQueue("request-created", (msg) => {
  console.log("request created. Data", msg);
});
receiveFromQueue("request-approved", (msg) => {
  console.log("request approved. Data", msg);
});
