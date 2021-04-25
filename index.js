/*
 * @Description: 
 * @Author: qxp
 * @Date: 2020-12-25 14:24:24
 * @LastEditors: qxp
 * @LastEditTime: 2021-04-25 15:12:07
 */
const fs = require('fs')
const program = require('commander');
const pkg = require('./package.json');
const inquirer = require('inquirer');
const ora = require('ora');
const download = require('download-git-repo');
const execSync = require('child_process').execSync;
// const handlebars = require('handlebars'); // 最好弄成模板替换，例模板内容占位为 {{name}}
const chalk = require('chalk');

program
    .version(pkg.version, '-v, --version')
    .command('init <name>')
    .action((name) => {
		checkVersion();
		
        if (!fs.existsSync(name)) {
            inquirer.prompt([{
					type: 'list',
					name: 'branch',
					choices: ['master', 'last'],
                    message: 'please choose a version of template:',
				},
				{
                    name: 'name',
                    message: 'please enter a name of this project:',
                },
                {
                    name: 'description',
                    message: 'please enter a description:',
                },
                {
                    name: 'author',
                    message: 'please enter a author:',
                }
            ]).then((answers) => {
				const { branch, name: pkgName, description, author } = answers;
				const spinner = ora('downloading template...');
				
                spinner.start();
				const downloadPath = `direct:http://git.bbdops.com/frontend/scaffolding/react-scaffolding.git#${branch}`;
				
                download(downloadPath,
                    name, { clone: true }, (err) => {
                        if (err) {
                            spinner.fail()
                            consoleLog(`${err}download template fail,please check your network connection and try again`, 'red');
                            process.exit(1)
						}
						
						spinner.succeed()
						
                        const meta = {
                            name: pkgName,
                            description,
                            author
                        }
                        const fileName = `${name}/package.json`
                        // 使用模板时用此代码 --- start ---
                        // const content = fs.readFileSync(fileName).toString();
                        // const result = handlebars.compile(content)(meta)
                        // --- end ---
                        const content = JSON.parse(fs.readFileSync(fileName));
						const result = JSON.stringify(Object.assign(content, meta));
                        fs.writeFileSync(fileName, result)
                    })
            })
        } else {
			consoleLog('该项目已存在！', 'red');
		}
    })

// 控制台输出
function consoleLog(data, color = 'yellow') {
    const fn = chalk[color] || chalk.yellow
    console.log(fn(data))
}

// 检查cli版本
function checkVersion() {
    const pkgName = pkg.name
    const version = pkg.version
    try{
      const ltsVersion = execSync(`npm view ${pkgName} version --registry=http://verdaccio.bbdops.com/`) + '' // 返回 buffer 转 string
      consoleLog(`当前版本：${version}，最新版本：${ltsVersion}`)
      if (ltsVersion.trim() !== version) consoleLog(`cli 版本过旧，建议执行 npm i -g ${pkgName}@latest 升级 cli： ${version} -> ${ltsVersion} `)
    } catch(e) {
      consoleLog(e, 'red');
    }
}


program.parse(process.argv)