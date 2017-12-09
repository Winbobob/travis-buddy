const defaultScripts = require('../resources/default-scripts.json');

module.exports = (job, log, data) => new Promise((resolve, reject) => {
  const scriptLogs = [];
  let allScripts;

  if (!data.scripts) {
    if (!defaultScripts[data.language]) {
      return reject(new Error(`Deafult script was not found for '${data.language}'`));
    }

    allScripts = [defaultScripts[data.language]];
  } else if (Array.isArray(data.scripts)) {
    allScripts = data.scripts;
  } else {
    allScripts = [data.scripts];
  }

  allScripts.forEach((script) => {
    let scriptContents = log.substr(log.indexOf(script));
    scriptContents = scriptContents.split('\n').slice(1).join('\n');
    scriptContents = scriptContents.substr(0, scriptContents.indexOf('" exited with ')).trim();
    scriptContents = scriptContents.split('\n').slice(0, -1).join('\n');
    scriptContents = scriptContents.trim();

    if (scriptContents) {
      scriptLogs.push({
        command: script,
        contents: scriptContents,
      });
    }
  });

  return resolve({ ...job, scripts: scriptLogs });
});
