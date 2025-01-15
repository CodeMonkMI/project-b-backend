const QUEUE_URL = "amqp://rabbitmq:5672";
import amqp from "amqplib";
const sendToQueue = async (routingKey: string, msg: string) => {
  try {
    const connection = await amqp.connect(QUEUE_URL);

    const channel = await connection.createChannel();

    const exchange = "request";
    await channel.assertExchange(exchange, "direct", { durable: true });

    channel.publish(exchange, routingKey, Buffer.from(msg));
    console.log(`x message send to ${msg}:${routingKey}`);

    setTimeout(() => {
      connection.close();
    }, 1000);
  } catch (error) {
    console.log("rabit mq error");
    console.log(error);
  }
};

export default sendToQueue;
