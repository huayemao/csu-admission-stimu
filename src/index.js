var fs = require("fs");
const MAJORS = require("../data/Majors");
const config = require("../config");
const logger = require("./logger");
const CANDIDATES = require("../data/Candidates");

const COLORS = config.adimitStatusColors;
const CANDIDATE_MAPPER = config.tableFieldMapper.CANDIDATE;

const initCandidates = (CANDIDATES) => {
  // 考生数据预处理
  CANDIDATES.forEach((candidate, index) => {
    mapKeys(candidate);
    candidate.remarks = "未被录取";
    candidate.major = "";
    candidate.idcardNo = `'${candidate.idcardNo}`; // 防止被 Excel 读取为数值
    candidate.examNo = `'${candidate.examNo}`;
    candidate.ID = index + 1;
  });
  return CANDIDATES.sort(config.sortCandidates);

  function mapKeys(candidate) {
    Object.keys(CANDIDATE_MAPPER).forEach((key) => {
      const value = CANDIDATE_MAPPER[key];
      if (typeof value === "string") {
        candidate[key] = candidate[value];
        delete candidate[value];
      } else if (value.length) {
        candidate[key] = value.map((e) => candidate[e]);
        value.forEach((e) => {
          delete candidate[e];
        });
      }
    });
  }
};

const initMajors = (MAJORS) => {
  MAJORS.forEach((major) => {
    mapKeys(major);
  });

  function mapKeys(major) {
    const mapper = config.tableFieldMapper.MAJOR;
    Object.keys(mapper).forEach((key) => {
      const value = mapper[key];
      if (typeof value === "string") {
        major[key] = major[value];
        delete major[value];
        major.occupiedCount = 0;
      }
    });
  }
};

initCandidates(CANDIDATES);
initMajors(MAJORS);

const categories = Array.from(
  new Set(MAJORS.map(({ majorCategoryName }) => majorCategoryName))
);

categories.forEach((majorCategoryName) => {
  operate(majorCategoryName);
});

function operate(majorCategoryName) {
  let admittedCount = 0; //已经录取的人数
  let notiaojicount = 0; //因不接受调剂而未被录取的人数

  const adjustQueue = [];
  const title = config.title + "-" + majorCategoryName;
  logger.logStr += `# ${title}`;

  const candidates = CANDIDATES.filter(
    (candidate) => candidate.majorCategoryName === majorCategoryName
  );
  if (!candidates.length) {
    logger.logStr = "";
    return;
  }

  const majors = MAJORS.filter(
    (major) => major.majorCategoryName === majorCategoryName
  );

  const totalHeadCout = majors
    .map(({ headCount }) => headCount)
    .reduce((a, b) => a + b);

  logger.logStr += `\n### ${majorCategoryName} 录取计划`;

  logger.logMajorCategory(majors);


  logger.logStr += `\n\n### 按规则进行成绩排序\n按综合评价成绩优先的原则，从高分到低分排序\n综合评价成绩相同时，分别按面试考核成绩、高考优惠分以及语文、数学、外语等成绩从高分到低分排序`;

  logger.logCandidates(candidates.map((candidate) => getCandidate(candidate)));

  for (let num = 1; num <= candidates.length; num++) {
    const candidate = candidates[num - 1];
    const { acceptAdjustment, ID, name, majorOptions } = candidate;
    if (admittedCount + adjustQueue.length >= totalHeadCout) {
      logger.logStr += `\n\n### 调剂录取`;
      logger.logStr += `\n${majorCategoryName} 当前已录取 ${admittedCount} 人，待调剂 ${adjustQueue.length} 人，共${totalHeadCout} 人，达到招生计划人数，开始进入调剂序列
`;
      break;
    }

    logger.logCandidate(getCandidate(candidate), num);
    // console.log(candidate)

    for (let i = 1; i <= majorOptions.length; i++) {
      const majorName = candidate.majorOptions[i - 1];
      const getPreWord = (status) =>
        `\n- [x] 处理志愿${i}：<b style='color:${status}'>${
          majorName || "__"
        }</b>：`;

      if (!majorName) {
        logger.logStr +=
          getPreWord(COLORS.EMPTY) + `该考生志愿 ${i} 为空，跳过`;
        continue;
      }

      const major = majors.find(({ title }) => title === majorName);

      if (!major) {
        throw new Error(`专业不存在：${key} ${majorName}不存在`);
      }

      const { headCount, occupiedCount, occupiedCandidates } = major;

      const occupiedCandidatesStr = occupiedCandidates?.length
        ? `（${occupiedCandidates
            .map((name) => `<a href='#${name}'>${name}</a>`)
            .join("，")}）`
        : "";

      if (occupiedCount < headCount) {
        logger.logStr +=
          getPreWord(COLORS.FULLFILLED) +
          `共招收 ${headCount} 人，目前已经录取 ${occupiedCount} 人${occupiedCandidatesStr}，符合条件，<b style='color:${COLORS.FULLFILLED}'>被录取</b>`;
        candidate.remarks = "正常录取";
        candidate.major = majorName;

        major.occupiedCount++;
        if (!major.occupiedCandidates) {
          major.occupiedCandidates = [name];
        } else {
          major.occupiedCandidates.push(name);
        }

        admittedCount++;
        break;
      } else {
        logger.logStr +=
          getPreWord(COLORS.REJECTED) +
          `共招收 ${headCount} 人，目前已经录取 ${occupiedCount} 人${occupiedCandidatesStr}，<b style='color:${COLORS.REJECTED}'>人数已满</b>`;
      }
    }

    if (candidate["major"] === "") {
      if (["服从", "是"].includes(acceptAdjustment)) {
        adjustQueue.push(ID);
        logger.logStr += `\n该生进入调剂序列！`;
      } else {
        notiaojicount++;
        candidate["remarks"] = "因不服从调剂未录取";
        logger.logStr += `\n<b style='color:${COLORS.REJECTED}'>该生因不服从调剂未录取！</b>`;
      }
    }
  }

  //该类型可以调剂（专业数量大于1）
  if (majors.length > 1) {
    //已经录取人数小于该类型招生人数，则需进行调剂
    const needAdjustStr =
      admittedCount < totalHeadCout
        ? "学生录取完毕，处理调剂考生..."
        : "已经录满，没有调剂名额";
    logger.logStr += `\n当前统计的录取人数：${admittedCount}人，${needAdjustStr}`;

    for (let num = 1; num <= adjustQueue.length; num++) {
      const ID = adjustQueue[num - 1];
      const remainedMajorNames = majors
        .filter(({ occupiedCount, headCount }) => headCount > occupiedCount)
        .map(({ title }) => title);

      if (remainedMajorNames.length === 0) {
        logger.logStr += `\n招生计划已经满，不能够录取任何考生，录取过程结束
        `;
        break;
      }

      const candidate = candidates.find((value) => value.ID == ID);

      logger.logCandidate(getCandidate(candidate), num, true);

      const radomNum = Math.floor(Math.random() * remainedMajorNames.length);
      const majorName = remainedMajorNames[radomNum];
      candidate.major = majorName;
      candidate.remarks = "调剂录取";
      const major = majors.find(({ title }) => title === majorName);
      const { headCount, occupiedCount } = major;
      logger.logStr += `\n找到未录取满的专业： <b style='color:${COLORS.FULLFILLED}'>${majorName}</b> 招收 ${headCount} 人，目前已经录取 ${occupiedCount} 人，符合条件，被<b style='color:${COLORS.FULLFILLED}'>调剂录取</b>`;
      major.occupiedCount++;
      admittedCount++;
    }
  }

  function serializeCandidate(candidate) {
    Object.keys(CANDIDATE_MAPPER).forEach((key) => {
      const value = CANDIDATE_MAPPER[key];
      if (typeof value === "string") {
        candidate[value] = candidate[key];
        delete candidate[key];
      } else if (value.length) {
        value.forEach((e, i) => {
          candidate[e] = candidate[key][i];
        });
        delete candidate[key];
      }
    });
  }

  function getCandidate(candidate) {
    const res = { ...candidate };
    Object.keys(CANDIDATE_MAPPER).forEach((key) => {
      const value = CANDIDATE_MAPPER[key];
      if (typeof value === "string") {
        res[value] = candidate[key];
        delete res[key];
      } else if (value.length) {
        value.forEach((e, i) => {
          res[e] = candidate[key][i];
        });
        delete res[key];
      }
    });
    return res;
  }

  candidates.forEach((candidate) => {
    serializeCandidate(candidate);
  });

  !fs.existsSync('./output') && fs.mkdirSync('./output')
  fs.writeFileSync(`./output/${title}.json`, JSON.stringify(candidates));
  console.log("导出数据完成");

  logger.logStr += `\n\n### 录取结束\n处理完毕, ${majorCategoryName} 中共有 ${admittedCount} 人被录取！${notiaojicount} 人因不服从调剂而未录取，${adjustQueue.length} 人执行调剂！`;
  fs.writeFileSync(`./output/${title}.md`, logger.logStr);
  console.log("导出处理记录完成");
}
