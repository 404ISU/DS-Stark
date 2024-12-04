const path = require("path");
const getAllFiles = require("./getAllFiles");

module.exports = (exepctions=[]) => {
  let modals = [];
  const modalFiles = getAllFiles(path.join(__dirname, "..", "modals"));

 
    for (const modalFile of modalFiles) {
      const modalObject = require(modalFile);


      if(exepctions.includes(modalObject.name)) continue;
      modals.push(modalObject);

  };

  return modals;
};

