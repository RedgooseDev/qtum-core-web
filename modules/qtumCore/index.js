/**
 * qtum core
 * qtum-core와 통신하기 위한 인터페이스
 */

const fs = require('fs');
const childProcess = require('child_process');
const env = require('../env');

const config = env.get();
let address = null;


/**
 * get address
 *
 * @return {Boolean}
 */
function getAddress()
{
	address = config.CORE_ADDRESS || null;
	return address;
}

/**
 * check exec
 *
 * @param {String} file
 * @return {Object}
 */
function checkExec(file='qtum-cli')
{
	if (!getAddress())
	{
		return {
			status: 'error',
			message: `not found qtum-core address`,
		};
	}

	let addr = `${address}/${file}`;

	if (fs.existsSync(addr))
	{
		return {
			status: 'success',
			command: addr
		};
	}
	else
	{
		return {
			status: 'error',
			command: addr,
			message: `not found qtum-cli`,
		};
	}
}

/**
 * run cli
 *
 * @param {String} file
 * @param {Boolean} testnet
 * @param {String} params
 * @param {Boolean} json
 * @param {Function} callback
 */
function cli(file='qtum-cli', testnet=null, params='', json=true, callback)
{
	if (!(callback && typeof callback === 'function')) callback({
		status: 'error',
		message: 'Not found callback'
	});

	const cmd = checkExec(file);
	testnet = (typeof testnet !== 'boolean') ? config.TESTNET : testnet;

	function onChildProcess(error, stdout, stderr)
	{
		if (error)
		{
			callback({
				status: 'error',
				message: error
			});
			return;
		}

		if (stdout)
		{
			try
			{
				callback({
					status: 'success',
					data: json ? JSON.parse(stdout) : stdout
				});
			}
			catch(e)
			{
				callback({
					status: 'error',
					message: `parsing error/${e}`,
				});
			}
			return;
		}

		if (stderr)
		{
			callback({
				status: 'error',
				message: 'stderr'
			});
		}
	}

	// run
	if (cmd.status === 'success')
	{
		childProcess.exec(`${cmd.command} ${testnet ? '-testnet' : ''} ${params}`, onChildProcess);
	}
	else
	{
		callback(cmd);
	}
}


/**
 * action command
 *
 * @param {String} cmd
 * @param {Boolean} testnet
 * @param {Boolean} json
 * @param {Function} cb
 */
exports.action = function(cmd, testnet, json=true, cb)
{
	cli('qtum-cli', testnet, cmd, json, cb);
};

/**
 * check core
 *
 * @param {Boolean} testnet
 * @param {Function} cb
 */
exports.check = function(testnet=null, cb)
{
	cli('qtum-cli', testnet, 'getinfo', true, function(res) {
		if (res.status === 'error')
		{
			cb(false, res.message);
		}
		else
		{
			cb(!!(res && res.status === 'success' && res.data && !!res.data.version));
		}
	});
};