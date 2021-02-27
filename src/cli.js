import fs from 'fs';
import path from 'path';
import arg from 'arg';
import inquirer from 'inquirer';
import chalk from 'chalk';
import getTemplate from '../templates';
import download from '../download';
import unzip from '../unzip';

function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
   {
     '--git': Boolean,
     '--yes': Boolean,
     '--install': Boolean,
     '-g': '--git',
     '-y': '--yes',
     '-i': '--install',
   },
   {
     argv: rawArgs.slice(2),
   }
 );
 return {
   skipPrompts: args['--yes'] || false,
   git: args['--git'] || false,
   name: args._[0],
   template: args._[1],
   runInstall: args['--install'] || false,
 };
}

function createProjectDir(name) {
  if(!name){
    console.error('%s', chalk.red.bold('ERROR Please specify the name of project!'));
    process.exit(1);
  }
  if(fs.existsSync(name)) {
    console.error('%s', chalk.red.bold('ERROR Cannot create project. A directory with project name already exists!'));
    process.exit(1);
  }
  fs.mkdirSync(name);
}

async function promptForMissingOptions(options) {
 const defaultTemplate = 'JavaScript';
 if (options.skipPrompts) {
   return {
     ...options,
     template: options.template || defaultTemplate,
   };
 }

 const questions = [];
 if (!options.template) {
   questions.push({
     type: 'list',
     name: 'template',
     message: 'Please choose which project template to use',
     choices: ['JavaScript', 'TypeScript'],
     default: defaultTemplate,
   });
 }

 if (!options.git) {
   questions.push({
     type: 'confirm',
     name: 'git',
     message: 'Initialize a git repository?',
     default: false,
   });
 }

 const answers = await inquirer.prompt(questions);
 return {
   ...options,
   template: options.template || answers.template,
   git: options.git || answers.git,
 };
}

function resolveTemplate(options) {
  const name = options.template || defaultTemplate;
  return getTemplate(name);
}

function randomFilename() {
  let file = (Math.random() + 1).toString(36).substr(5);
  while(fs.existsSync(file)) {
    file = (Math.random() + 1).toString(36).substr(5);
  }
  return file;
}

function scaffold(options) {
  const dir = options.name;
  const temp = randomFilename();
  createProjectDir(dir);
  resolveTemplate(options).then(url => {
    download(url, temp);
  }).then(() => {
    unzip(temp, dir, true);
    fs.unlink(temp, () => {
      console.log('%s', chalk.green.bold(`Project ${dir} successfully created`));
    });
  }).catch(err => {
    fs.unlink(dir, () => {});
    fs.unlink(temp, () => {});
    console.error(err);
  });
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  scaffold(options);
  //console.log(options);
}