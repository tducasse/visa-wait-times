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

const visaNames = {
  visitor: "Visitor Visa",
  student: "Student/Exchange Visitor Visas",
  other: "All Other Nonimmigrant Visas",
};

const visas = Object.values(visaNames);

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
      return (
        waitTimes[visas[0]] !== "" && {
          city: value,
          ...waitTimes,
        }
      );
    })
  );
  results
    .filter(Boolean)
    .sort((a, b) => Number(a[visaNames.other]) - Number(b[visaNames.other]))
    .forEach((r) => console.log(r.city.padEnd(20), r[visaNames.other]));
};

run();
