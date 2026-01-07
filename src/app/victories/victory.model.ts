import { DayOfWeek } from "../shared/constants";

export class Victory {
  constructor(
    public id: string,
    public day: DayOfWeek,
    public number: number,
    public victory: string,
    public _id?: string
  ) {}
}