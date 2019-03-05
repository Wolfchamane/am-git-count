/* eslint no-console : 0 */
const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

/**
 * Recupera todos los directorios locales qué son proyectos GIT
 *
 * @param   {String}    root    Ruta del directorio
 * @return  {Array} Directorios GIT
 */
const findGitFolder = root =>
{
    let folders = [];
    if (fs.existsSync(root))
    {
        const stats = fs.statSync(root);
        if (stats.isDirectory())
        {
            const gitFolder = path.resolve(root, '.git');
            if (fs.existsSync(gitFolder))
            {
                folders.push(root);
            }
            else
            {
                fs.readdirSync(root).forEach(
                    item =>
                    {
                        folders = folders.concat(findGitFolder(path.resolve(root, item)));
                    }
                );
            }
        }
    }

    return folders;
};

/**
 * Retorna el commando para actualizar un repositorio
 *
 * @param   {String}    folder  Directorio
 * @return  {String}    Commando git
 */
const update = folder =>
{
    console.log(`Updating folder: ${folder}`);

    return `git -C ${folder} fetch -p --all`;
};

/**
 * Retorna el commando para recuperar todos los commits de un directorio.
 *
 * @param   {String}    folder  Directorio
 * @return  {String}    Commando GIT
 */
const command = folder =>
{
    console.log(`Evaluating commits @ ${folder}`);

    return `git -C ${folder} shortlog -s -n --all`;
};

/**
 * Retorna el alias de un usuario.
 *
 * @param   {String}    value   Nombre del usuario qué realizó el commit
 * @return  {String}    Alias del usuario
 */
const aliasMap = (value = '') =>
{
    let alias = '';

    switch (value)
    {
        // @todo: rebuild alias for users
    }

    return alias;
};

const records = [];
/**
 * Retorna el número de commits de todos los usuarios de un directorio
 *
 * @param   {String}    folder  Directorio
 */
const getFolderCommits = folder =>
{
    execSync(update(folder));
    let result = execSync(command(folder)).toString();
    result = result.trim().split(/\n/g);
    result.forEach(
        record =>
        {
            record = record.split(/\t/g);
            record[1] = record[1].replace(/[^a-zA-Z]/g, '_').replace(/_/g, '');
            record[1] = record[1].replace(/\s+/g, '').toLowerCase();

            const recordName = aliasMap(record[1]);
            const recordValue = Number(record[0]);

            let input = records.find(item => item.name === recordName);
            if (input)
            {
                input.commits += recordValue;
            }
            else
            {
                input = {
                    name    : recordName,
                    commits : recordValue
                };
                records.push(input);
            }
        }
    );
};

// MAIN //
const folders = findGitFolder(process.cwd());
folders.forEach(getFolderCommits);
console.log(records.sort((a, b) => a.commits > b.commits ? -1 : a.commits < b.commits ? 1 : 0));
