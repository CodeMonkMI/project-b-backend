const axios = require("axios");

class CustomAuthenticate {
  constructor(config) {
    this.config = config;
  }
  async access(kong) {
    try {
      const headers = await kong.request.getHeaders();
      const token_place = this.config.token_place || "Authorization";
      const authHeader =
        headers[token_place.toLowerCase()] &&
        headers[token_place.toLowerCase()][0];
      const token = authHeader ? authHeader.split(" ")[1] : null;

      kong.log.notice(`Token: ${token}`);

      if (!token) {
        return await kong.response.exit(401, {
          message: "Unauthorized!",
        });
      }

      const res = await axios.post(this.config.validation_endpoint, {
        accessToken: token,
      });

      if (res.status !== 200) {
        return await kong.response.exit(401, {
          message: "Unauthorized!",
        });
      }
      const user = res.data.user;
      kong.service.request.set_header("X-User-ID", user.id);
      kong.service.request.set_header("X-User-Username", user.username);
      kong.service.request.set_header("X-User-Email", user.email);
      kong.service.request.set_header("X-User-Status", user.status);
      kong.service.request.set_header("X-User-Role", user.role.role);

      return;
    } catch (error) {
      const message = error.message || "Unauthorized";

      kong.log.notice(` >>> ${JSON.stringify(error)} <<< `);

      return await kong.response.exit(401, {
        message: "Unauthorized!",
      });
    }
  }
}

module.exports = {
  Plugin: CustomAuthenticate,
  Schema: [
    {
      validation_endpoint: {
        type: "string",
        required: true,
        description:
          "The URL of the external authentication server's validation endpoint.",
      },
    },
    {
      token_place: {
        type: "string",
        required: false,
        default: "Authorization",
      },
    },
  ],
  Version: "1.0.0",
  Priority: 0,
};
