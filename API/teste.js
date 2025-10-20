
import { buildAuthorization, getUserProfile ,getGameInfoAndUserProgress} from "@retroachievements/api";
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.ra_username;
const webApiKey = process.env.ra_webApiKey;
// const authorization = buildAuthorization({ username, webApiKey });

let name = process.env;
console.log(name);

// // Then, make the API call.
// const userProfile = await getUserProfile(authorization, {
//   username: name,
// });

// console.log(userProfile);

// // Then, make the API call.
// const gameInfoAndUserProgress = await getGameInfoAndUserProgress(
//   authorization,
//   {
//     username: "MaxMilyin",
//     gameId: 14402,
//   },
// );

// console.log(gameInfoAndUserProgress)