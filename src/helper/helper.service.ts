import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export default class HelperService {
  parsedIsoStringToDateTime(dateString: string) {
    const d = new Date(dateString);
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  }

  validationYYYYMMDD(dateString: string) {
    const regex = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    return regex.test(dateString);
  }

  parsedYYYYMMDDToDate(dateString: string) {
    if (this.validationYYYYMMDD(dateString)) {
      const [year, month, date] = dateString.split('-');
      const d = new Date();
      d.setDate(parseInt(date));
      d.setMonth(parseInt(month));
      d.setFullYear(parseInt(year));
      return d;
    } else {
      throw new HttpException('invalid date', HttpStatus.BAD_REQUEST);
    }
  }
}
