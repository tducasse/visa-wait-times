import { get } from "node:https";
import { cities } from "./cities.js";

const buildUrl = (cid) =>
  `https://travel.state.gov/content/travel/resources/database/database.getVisaWaitTimes.html?cid=${cid}&aid=VisaWaitTimesHomePage`;

const request = async (url) =>
  new Promise((resolve) => {
    get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    });
  });

const visas = [
  "Visitor Visa",
  "Student/Exchange Visitor Visas",
  "All Other Nonimmigrant Visas",
];

const getWaitTimes = (waitTimes) =>
  waitTimes
    .replace(/(\r\n|\n|\r)/gm, "")
    .replace(/[a-z ]+/gim, "")
    .split(",")
    .reduce(
      (acc, curr, i) => (i < visas.length ? { ...acc, [visas[i]]: curr } : acc),
      {}
    );

const run = async () => {
  const results = await Promise.all(
    cities.map(async (city) => {
      const { code, value } = city;
      const response = await request(buildUrl(code));
      const waitTimes = getWaitTimes(response);
      return {
        city: value,
        ...waitTimes,
      };
    })
  );
  console.log(results);
};

run();
