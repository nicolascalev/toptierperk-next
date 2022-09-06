import axios from "axios";

const axiosPaypal = axios.create({
  baseURL: process.env.PAYPAL_CLIENT_URL,
});

const paypal = {
  async getAccessToken() {
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      const data = await axiosPaypal
        .post(
          "/v1/oauth2/token",
          params,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            auth: {
              username: process.env.PAYPAL_CLIENT_ID as string,
              password: process.env.PAYPAL_CLIENT_SECRET as string,
            },
          }
        )
        .then((res) => res.data);
      return data.access_token;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  async getSubscriptionById(id: string) {
    try {
      const accessToken = await this.getAccessToken();

      const subscription = await axiosPaypal
        .get("/v1/billing/subscriptions/" + id, {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        })
        .then((res) => res.data);

      return subscription;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};

export default paypal;
