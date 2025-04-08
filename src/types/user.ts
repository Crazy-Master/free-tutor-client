export interface UserInfoDto {
    lastDisciplineId: number;
    studentIds: number[];
    notes: Record<number, string>;
  }
  
  export interface CreateUserDto {
    login: string;
    email: string;
    password: string;
    role: number;
    information: UserInfoDto;
  }
  