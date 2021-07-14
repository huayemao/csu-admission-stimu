const config = require("../config");
let logStr = "";

const CANDIDITE_MAPPER= config.tableFieldMapper.CANDIDATE
const MAJOR_MAPPER= config.tableFieldMapper.MAJOR
const CANDIDATES_EXCLUDEDE_FIELDS=config.fieldsToExclude.TABLE

exports.logStr = logStr;

exports.logMajorCategory =(majors)=>{
  const keys =Object.keys(majors[0]).filter(key=>key!='occupiedCount')
  exports.logStr += `\n|${keys.map((key)=>MAJOR_MAPPER[key]).join("|")}|\n|${keys.map((e) => "-").join("|")}|`;
  majors.forEach((major) => {
    exports.logStr += `\n|${keys.map((key) => major[key]).join("|")}|`;
  });
}

exports.logCandidates = (candidates) => {
  const fieldsToExclude = CANDIDATES_EXCLUDEDE_FIELDS;
  const keys = Object.keys(candidates[0]).filter(
    (key) => !fieldsToExclude.includes(key)
  );

  exports.logStr += `\n|${keys.join("|")}|\n|${keys.map((e) => "-").join("|")}|`;

  candidates.forEach((candidate) => {
    exports.logStr += `\n|${keys.map((key) => candidate[key]).join("|")}|`;    
  });
};

exports.logCandidate = (candidate, num, isRedistribute) => {
  const fieldsToExclude = config.fieldsToExclude.TABLE;

  const keys = Object.keys(candidate).filter(
    (key) => !fieldsToExclude.includes(key)
  );
  exports.logStr += `\n\n\n\n#### <a id="${candidate[CANDIDITE_MAPPER.name]}"> 第${num}位${
    isRedistribute ? "调剂" : ""
  }考生 ${candidate[CANDIDITE_MAPPER.name]}</a>
  身份证号：${candidate[CANDIDITE_MAPPER.idcardNo].replace(
    "'",
    ""
  )}，考号：${candidate[CANDIDITE_MAPPER.examNo].replace("'", "")}
  
  |${keys.join("|")}|
  |${keys.map((e) => "-").join("|")}|
  |${keys.map((key) => candidate[key]).join("|")}|
  
  |${CANDIDITE_MAPPER.majorOptions.join("|")}|
  |${CANDIDITE_MAPPER.majorOptions.map((e) => "-").join("|")}|
  |${CANDIDITE_MAPPER.majorOptions.map((key) => candidate[key]).join("|")}|
  `;
};
