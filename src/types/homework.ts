export enum HomeworkType {
    Classic = "Classic",
    Test = "Test",
  }
  
  export interface GenerateHomeworkDto {
    requestId: string;
    studentToTeacherId: number;
    automaticTotalTaskCount: number;
    currentTopicTaskCount: number;
    additionalTaskIds: number[];
    completeTopicsIds: number[];
    taskBanPeriodDays: number;
    group0Probability: number;
    group2Probability: number;
    group3Probability: number;
    type: 0 | 1;
  }

  export const defaultGenerateHomeworkDto: Omit<GenerateHomeworkDto, "studentToTeacherId" | "requestId"> = {
  automaticTotalTaskCount: 15,
  currentTopicTaskCount: 8,
  additionalTaskIds: [],
  completeTopicsIds: [],
  taskBanPeriodDays: 7,
  group0Probability: 0.1,
  group2Probability: 0.2,
  group3Probability: 0.3,
  type: 0,
};
  
//const [formData, setFormData] = useState<GenerateHomeworkDto>({
//    studentToTeacherId: selectedStudentId,
//    ...defaultGenerateHomeworkDto,
//  });
