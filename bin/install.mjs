#!/usr/bin/env node
import { promisify } from 'util';
import cp from 'child_process';
import path from 'path';
import fs, { existsSync, mkdirSync } from 'fs';
import prompts from 'prompts';
// cli spinners
import ora from 'ora';

// convert libs to promises
const exec = promisify(cp.exec);
const rm = promisify(fs.rm);
const mkdir = promisify(fs.mkdir);
const git_repo = 'https://github.com/Kuberanix/core-modules-backend-base.git';

if (process.argv.length < 3) {
  console.log('You have to provide a name to your app.');
  console.log('For example :');
  console.log('  npx kuberanix-backend-base api');
  process.exit(1);
}
const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);

const handleMailing = async () => {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Do you want to use mailing service?',
    choices: [
      { title: 'Yes', value: true },
      { title: 'No', value: false },
    ],
  });
  if (response.value === true) {
    const mailerSpinnter = ora(
      'Adding mailing folder and nodemailer...',
    ).start();
    const addMailFolder = mkdir(path.join(projectPath, 'mails'));
    await addMailFolder.then().catch((err) => console.log(err));
    await exec('npm install nodemailer');
    mailerSpinnter.succeed();
  }
};
const handleORM = async () => {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'which orm service you want to use?',
    choices: [
      { title: 'Prisma', value: 'prisma' },
      { title: 'Mongoose', value: 'mongoose' },
    ],
  });
  const ormSpinner = ora(`Adding ${response.value}`).start();
  if (response.value === 'prisma')
    await exec('npm install prisma --save-dev && npx prisma init');
  else {
    await exec('npm install mongoose');
    const addModelsFolder = mkdir(path.join(projectPath, 'models'));
    await addModelsFolder.then().catch((err) => console.log(err));
  }
  ormSpinner.succeed();
};
const handlePrompts = async () => {
  process.chdir(projectPath);
  await handleMailing();
  await handleORM();
};

// create project directory
if (fs.existsSync(projectPath)) {
  console.log(
    `The file ${projectName} already exist in the current directory, please give it another name.`,
  );
  process.exit(1);
} else {
  fs.mkdirSync(projectPath);
}

try {
  const gitSpinner = ora('Downloading files...').start();
  // clone the repo into the project folder -> creates the new boilerplate
  await exec(`git clone --depth 1 ${git_repo} ${projectPath} --quiet`);
  gitSpinner.succeed();

  await handlePrompts();

  const cleanSpinner = ora('Setting up files').start();
  const rmGit = rm(path.join(projectPath, '.git'), {
    recursive: true,
    force: true,
  });
  // remove the installation file
  const rmBin = rm(path.join(projectPath, 'bin'), {
    recursive: true,
    force: true,
  });
  await Promise.all([rmGit, rmBin]);
  process.chdir(projectPath);

  // remove the packages needed for cli
  await exec('npm uninstall ora cli-spinners prompts');
  cleanSpinner.succeed();

  const npmSpinner = ora('Installing dependencies...').start();
  await exec('npm install');
  npmSpinner.succeed();

  console.log('The installation is done!');
  console.log('You can now run your app with:');
  console.log(`    cd ${projectName}`);
  console.log(`    npm run dev`);
} catch (error) {
  // clean up in case of error, so the user does not have to do it manually
  fs.rmSync(projectPath, { recursive: true, force: true });
  console.log(error);
}
