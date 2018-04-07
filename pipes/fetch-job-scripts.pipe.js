const defaultScripts = require('../resources/default-scripts.json');

const getCommandFromJob = (job, language) => {
  let allScripts;
  if (job.script) {
    allScripts = [job.script];
  } else if (!defaultScripts[language]) {
    throw new Error(`Deafult script was not found for '${language}'`);
  } else {
    allScripts = [defaultScripts[language]];
  }

  return allScripts;
};

const getJobCommands = (context, job) => {
  let allScripts;
  if (!context.scripts) {
    allScripts = getCommandFromJob(job, context.language);
  } else if (Array.isArray(context.scripts)) {
    allScripts = context.scripts;
  } else {
    allScripts = [context.scripts];
  }

  return allScripts;
};

const cutScript = scriptContents => {
  scriptContents = scriptContents
    .split('\n')
    .slice(1)
    .join('\n');

  if (scriptContents.indexOf('" exited with ') > 0) {
    scriptContents = scriptContents
      .substr(0, scriptContents.indexOf('" exited with '))
      .trim();

    scriptContents = scriptContents
      .split('\n')
      .slice(0, -1)
      .join('\n');
  }

  scriptContents = scriptContents.trim();

  return scriptContents;
};

const getJobScripts = async (context, job) => {
  job.scripts = [];

  const allScripts = getJobCommands(context, job);

  allScripts.forEach(script => {
    let scriptContents = job.log.substr(job.log.indexOf(script));
    const exitCode = /exited\swith\s(\d+)/g.exec(scriptContents);
    if (!exitCode || Number(exitCode[1]) !== 0) {
      scriptContents = cutScript(scriptContents);

      if (scriptContents) {
        const isDuplicate = job.scripts.some(
          scriptLog => scriptLog.contents === scriptContents,
        );

        if (!isDuplicate) {
          job.scripts.push({
            command: script,
            contents: scriptContents,
          });
        }
      }
    }
  });

  return job;
};

const fetchJobScripts = async context => {
  context.jobs = await Promise.all(
    context.jobs.map(job => getJobScripts(context, job)),
  );
  context.jobs = context.jobs.filter(job => job.scripts.length > 0);

  return context;
};

module.exports = fetchJobScripts;
