import { Perusahaan } from "./perusahaan/perusahaan.entity";

declare global {
    namespace Express {
      interface Request {
        perusahaan?: Perusahaan;  // Add the user property to the Request interface
      }
    }
  }