const QUEUE_URL = "amqp://rabbitmq:5672";

import amqp from "amqplib";

const sendToQueue = async (routingKey: string, msg: string) => {
  // create connections
  const connection = await amqp.connect(QUEUE_URL);

  // create channel
  const channel = await connection.createChannel();

  // assert exchange
  const exchangeName = "auth";
  await channel.assertExchange(exchangeName, "direct", { durable: true });

  // publish
  channel.publish(exchangeName, routingKey, Buffer.from(msg));
  console.log(`x message send to ${msg}:${routingKey}`);

  // close connection
  setTimeout(() => {
    connection.close();
  }, 1000);
};

export default sendToQueue;
