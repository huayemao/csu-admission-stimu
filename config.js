module.exports = {
  adimitStatusColors: {
    EMPTY: "gray",
    FULLFILLED: "rgb(35, 134, 123)",
    REJECTED: "rgb(162, 70, 104)",
  },
  title: "2021湖南综合评价专业录取记录",
  tableFieldMapper: {
    CANDIDATE: {
      majorCategoryName: "报考科类",
      name: "姓名",
      idcardNo: "身份证号",
      examNo: "考号",
      majorOptions: ["志愿1", "志愿2", "志愿3", "志愿4", "志愿5"],
      grades: ["综合成绩", "面试成绩", "优惠分", "语文"], // 按照筛选顺序排序
      acceptAdjustment: "是否服从调剂",
      major: "录取专业",
      remarks: "备注",
    },
    MAJOR: {
      majorCategoryName: "所属类别",
      title: "专业名称",
      headCount: "招生计划",
    },
  },

  fieldsToExclude: {
    CANDIDITE_DETAIL: [
      "高考成绩",
      "ID",
      "准考证号",
      "性别",
      "录取专业",
      "备注",
      "姓名",
      "身份证号",
      "考号",
      "报考科类",
      "志愿1",
      "志愿2",
      "志愿3",
      "志愿4",
      "志愿5",
    ],
    TABLE: [
      "高考成绩",
      "准考证号",
      "性别",
      "录取专业",
      "备注",
      "身份证号",
      "考号",
      "报考科类",
      "志愿1",
      "志愿2",
      "志愿3",
      "志愿4",
      "志愿5",
    ],
    MAJOR:["occupiedCount"]
  },

  sortCandidates: (a, b) => {
    return (
      b.grades[0] - a.grades[0] ??
      b.grades[1] - a.grades[1] ??
      b.grades[2] - a.grades[2] ??
      b.grades[3] - a.grades[3]
    );
  },
};
