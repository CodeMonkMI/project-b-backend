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
      console.log("got token", token);

      if (!token) {
        console.log("not token");
        return await kong.response.exit(401, {
          message: "Unauthorized!",
        });
      }
      console.log("has token!");
      const res = await axios.post(this.config.validation_url, {
        accessToken: token,
      });

      if (res.status !== 200) {
        console.log(res.data);
        console.log("token in not valid");
        return await kong.response.exit(401, {
          message: "Unauthorized!",
        });
      }
      const user = res.data.user;
      console.log("go user", user);
      kong.service.request.set_header("X-User-ID", user.id);
      kong.service.request.set_header("X-User-Username", user.username);
      kong.service.request.set_header("X-User-Email", user.email);
      kong.service.request.set_header("X-User-Status", user.status);
      kong.service.request.set_header("X-User-Role", user.role.role);

      return;
    } catch (error) {
      const message = error.message || "Unauthorized";
      return await kong.response.exit(401, {
        message,
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
