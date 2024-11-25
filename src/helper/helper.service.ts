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
    const regex = new RegExp(/^(?(?=000+)\d{3}[1-9]|\d{3}[0-9])-(?(?=\d{2})(?(?=0+)0[1-9]|1[0-2])|[1-9])-(?(?=\d{2})(?(?=3+)[0-3][0-1]|[0-3][0-9])|[1-9])$/);
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
