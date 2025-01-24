import amqp from "amqplib";
import generateUniqueUsername from "./lib/core/generateUniqueUsername";
import prisma from "./prisma";
import { CreateAuthUserDTO } from "./schemas";

const QUEUE_URL = "amqp://rabbitmq:5672";

const receiveFromQueue = async (
  queue: string,
  callback: (msg: string) => void
) => {
  try {
    // create connection
    console.log("connection");
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
      if (msg) {
        callback(msg.content.toString());
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.log("rabbit mq error", error);
  }
};

const start = () => {
  receiveFromQueue("auth-user-signup", async (msg) => {
    try {
      const {
        email,
        bloodGroup,
        firstName,
        lastName,
        role,
      }: CreateAuthUserDTO = JSON.parse(msg);
      console.log("auth-user-signup data received");
      const username = await generateUniqueUsername(firstName, lastName);
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          role: role,
          profile: {
            create: {
              firstName,
              lastName,
              bloodGroup: bloodGroup,
            },
          },
        },
      });

      console.log("auth-user-signup: user created", newUser.id);
    } catch (error) {
      console.log(`RabbitMQ Error: auth-user-signup`, msg, error);
    }
  });
};

export default start;
