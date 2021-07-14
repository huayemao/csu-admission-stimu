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
      examNo: "考生号",
      majorOptions: ["志愿1", "志愿2", "志愿3", "志愿4", "志愿5"],
      grades: ["综合评价成绩", "面试成绩", "优惠分", "语文","数学","外语"], // 按照筛选顺序排序
      acceptAdjustment: "服从调剂",
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
      "中学名称",
      "高考成绩",
      "ID",
      "准考证号",
      "性别",
      "录取专业",
      "备注",
      "姓名",
      "身份证号",
      "考生号",
      "报考科类",
      "志愿1",
      "志愿2",
      "志愿3",
      "志愿4",
      "志愿5",
    ],
    TABLE: [
      "ID",
      "中学名称",
      "高考成绩",
      "准考证号",
      "性别",
      "录取专业",
      "备注",
      "身份证号",
      "考生号",
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
    const comparater =(
      b.grades[0] - a.grades[0] ||
      b.grades[1] - a.grades[1] 
      ||
      b.grades[2] - a.grades[2] ||
      b.grades[3] - a.grades[3] ||
      b.grades[4] - a.grades[4] ||
      b.grades[5] - a.grades[5]
    )
    if(comparater ==0){
      console.log('分数无法区分')
      console.log(a)
    }
    return (
      b.grades[0] - a.grades[0] ||
      b.grades[1] - a.grades[1] 
      ||
      b.grades[2] - a.grades[2] ||
      b.grades[3] - a.grades[3] ||
      b.grades[4] - a.grades[4] ||
      b.grades[5] - a.grades[5]
    );
  },
};
