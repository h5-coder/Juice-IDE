/*
 * @Author: liangyanxiang
 * @Date: 2017-10-25 17:34:42
 * @Last Modified by: liangyanxiang
 * @Last Modified time: 2017-12-13 10:02:22
 */
//引入web3
let Web3 = require('web3'),
    EthereumTx = require('ethereumjs-tx');

import consoleService from '@/services/console/console-service';
import APIServies from '@/services/API-servies';
import DeployLogService from '@/services/deploy/deploy-log-servises'

const deployLogService = new DeployLogService();

//内置合约abi,地址
const DEFAULT_ABI = [{
        "constant": false,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }, {
            "name": "_contractName",
            "type": "string"
        }, {
            "name": "_contractVersion",
            "type": "string"
        }],
        "name": "register",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_addr",
            "type": "address"
        }],
        "name": "findModuleNameByAddress",
        "outputs": [{
            "name": "_moduleName",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_contractAddr",
            "type": "address"
        }],
        "name": "IfContractRegist",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "unRegister",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }],
        "name": "IfModuleRegist",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }],
        "name": "getModuleAddress",
        "outputs": [{
            "name": "_address",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{
            "name": "_fromModuleNameAndVersion",
            "type": "string"
        }, {
            "name": "_fromNameAndVersion",
            "type": "string"
        }, {
            "name": "_toModuleNameAndVersion",
            "type": "string"
        }, {
            "name": "_toNameAndVersion",
            "type": "string"
        }, {
            "name": "_signString",
            "type": "string"
        }],
        "name": "transferContract",
        "outputs": [{
            "name": "_errno",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }, {
            "name": "_contractName",
            "type": "string"
        }, {
            "name": "_contractVersion",
            "type": "string"
        }],
        "name": "IfContractRegist",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }, {
            "name": "_newOwner",
            "type": "address"
        }],
        "name": "changeModuleRegisterOwner",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }],
        "name": "register",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_addr",
            "type": "address"
        }],
        "name": "findContractVersionByAddress",
        "outputs": [{
            "name": "_contractVersion",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_addr",
            "type": "address"
        }],
        "name": "findResNameByAddress",
        "outputs": [{
            "name": "_contractName",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }, {
            "name": "_contractName",
            "type": "string"
        }, {
            "name": "_contractVersion",
            "type": "string"
        }, {
            "name": "_newOwner",
            "type": "address"
        }],
        "name": "changeContractRegisterOwner",
        "outputs": [{
            "name": "",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_moduleName",
            "type": "string"
        }, {
            "name": "_moduleVersion",
            "type": "string"
        }, {
            "name": "_contractName",
            "type": "string"
        }, {
            "name": "_contractVersion",
            "type": "string"
        }],
        "name": "getContractAddress",
        "outputs": [{
            "name": "_address",
            "type": "address"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_addr",
            "type": "address"
        }],
        "name": "findModuleVersionByAddress",
        "outputs": [{
            "name": "_moduleVersion",
            "type": "uint256"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_pageNum",
            "type": "uint256"
        }, {
            "name": "_pageSize",
            "type": "uint256"
        }],
        "name": "getRegisteredContract",
        "outputs": [{
            "name": "_json",
            "type": "string"
        }],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{
            "name": "_moduleAddr",
            "type": "address"
        }],
        "name": "IfModuleRegist",
        "outputs": [{
            "name": "",
            "type": "bool"
        }],
        "payable": false,
        "type": "function"
    }, {
        "inputs": [],
        "payable": false,
        "type": "constructor"
    }],
    DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000011';

//是否为数组
const isArray = (o) => {
        return Object.prototype.toString.call(o) === '[object Array]';
    },
    isJson = (obj) => {
        let isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
        return isjson;
    },
    isString = (str) => {
        return (typeof str == 'string') && str.constructor == String;
    },
    dealArgumentList = (argumentList) => {
        let result = argumentList.map(function (item, index, input) {
            if (isJson(item)) {
                return JSON.stringify(item);
            }
            return item;
        });
        return result;
    },
    dealData = (str) => {
        const code = parseInt(str.substr(2, 64), 16),
            start = parseInt(str.substr(66, 64), 16),
            dataLength = parseInt(str.substr(130, 64), 16) * 2,
            data = str.substr(194, dataLength);
        if (dataLength % 2 == 0) { //当输入够偶数位；
            var StrHex = "";
            for (var i = 0; i < dataLength; i = i + 2) {
                var str = data.substr(i, 2); //16进制；

                var n = parseInt(str, 16); //10进制；
                StrHex = StrHex + String.fromCharCode(n);
            }
        }
        console.log('code==', code, 'data==', data);
        return {
            code: code,
            data: StrHex,
        }
    };

//请求类
class DeployService {
    constructor() {
        this.web3 = null;
        this.provider = localStorage.getItem('chainInfo') ? JSON.parse(localStorage.getItem('chainInfo')).url : 'http://10.10.8.42:6789'; //节点地址18
        this._contracts = {}; //所有的合约
        this.callbacks = {}; //存放sendRawTrasaction回调函数
        this.wrapCount = 60; //轮询次数
        this.timeout = 60; //超时时间
        this.user = {
            privateKey: '',//用户私钥9842e8e174e70eb133354ccd46e1b8ade11540e52eb2afd8310cfb01208a9558
            address: '', //用户钱包地址
            username: '',//用户名
            type:'',
        }

        //部署结果
        this.result = {
            contractAddress: '',
            TxHash: '',
            From: '',
        }

        this.data = {};

        this.queryTime = '';//查询用户打印的日志
        this.queryBackgroundTime = '';//查询后台打印的日志
    }

    //设置节点地址
    setProvider(url) {
        this.provider = url;
        try {
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider));
            this.initRegisterContract();
            return true;
        } catch (e) {
            console.warn(e);
            alert('sorry,找不到链！！！');
            return false;
        }
    }

    /*
     * 注册一个内置合约
     * contractName 合约名   来源：合约开发文档/合约代码
     * ABI  来源：合约开发文档/合约代码
     * address 合约地址    来源：合约部署后的地址
     */
    initRegisterContract(ABI = DEFAULT_ABI, address = DEFAULT_ADDRESS) {
        let REGContract = this.web3.eth.contract(ABI),
            _registerInstance = REGContract.at(address),
            registerInstance = {
                ABI: ABI,
                address: address,
                contract: _registerInstance,
            };

        this._contracts["RegisterManager"] = registerInstance;
    };

    //部署合约
    deploy(fileName, contractName, abi, bin, userAddress) {
        console.log('abi', abi)

        this.user.address = userAddress;
        this.deployStart(fileName, contractName);
        this.result = {
            contractAddress: '',
            TxHash: '',
            From: userAddress,
            abi:''
        };

        return new Promise((resolve, reject) => {
            this.deployRunning();
            let calcContract = this.web3.eth.contract(abi);
            this.result.abi = abi;
            //16进制 需要加上0x
            bin.substring(0, 2) == '0x' ? "" : bin = '0x' + bin;

            try {
                const txParams = {
                    nonce: this.web3.nonce(),
                    gasPrice: 20000000000,
                    gasLimit: 4300000,
                    gas:9999999999999,
                    value: 0,
                    data: bin,
                };

                this.sign(txParams).then((serializedTxHex) => {
                    calcContract.deploy(serializedTxHex, (err, myContract) => {
                        console.log('err', err, myContract)
                        if (!err) {
                            this.getBackgroundLog(this.provider, this.queryBackgroundTime);
                            if (!myContract.address) {
                                this.result.TxHash = myContract.transactionHash;
                                console.log("部署合约的交易哈希值: " + myContract.transactionHash);
                            } else {
                                console.log("合约的部署地址: " + myContract.address);
                                this.getContractLog(this.provider, myContract.address, this.queryTime);
                                this.result.contractAddress = myContract.address;
                                this.data[myContract.address] = {
                                    contractAddress: this.result.contractAddress,
                                    from: this.result.From,
                                    fileName: fileName,
                                    contractName: contractName,
                                    contract: myContract
                                };

                                this.deployFinish();
                                resolve(myContract.address);
                            }
                        } else {
                            resolve();
                            console.warn(err);
                            this.deployFailure(err);
                        }
                    });
                });
            } catch (error) {
                console.warn(error);
                this.deployFailure(error);
            }
        })
    }

    //合约部署-开始
    deployStart(fileName, contractName) {
        let time = new Date().Format("yyyy-MM-dd HH:mm:ss"),
            str = `${fileName}:${contractName}合约正在部署`;
        consoleService.output(time, '[开始部署]', str, );
        deployLogService.push(time, '[开始部署]', str);
        this.getBackgroundLog(this.provider, this.queryBackgroundTime);
    }

    //合约部署-部署中
    deployRunning() {
        return new Promise((resolve, reject) => {
            resolve()
        })
    }

    //合约部署-部署完成
    deployFinish() {
        consoleService.output('[部署结果]', {
            logSuccess: 'Deploy Success'
        }, this.result);
        deployLogService.push('[部署结果]', {
            logSuccess: 'Deploy Success'
        }, this.result);
    }

    //合约部署-部署失败
    deployFailure(err) {
        consoleService.output('[部署结果]', {
            logError: 'Deploy failure'
        }, {
            info: err.message
        });
        deployLogService.push('[部署结果]', {
            logError: 'Deploy failure'
        }, {
            logError: err.message
        });
        return new Promise((resolve, reject) => {
            resolve()
        })
    }


    /* 运行合约
     *contractAddress 合约地址
     *
     */
    run(contractAddress, contractFnName, argumentList, cb) {
        console.log(contractAddress, contractFnName, argumentList);

        //合约
        const contract = this.data[contractAddress].contract;

        if (!contract) {
            this.runFailure(`找不到${contractAddress}对应的合约`);
            resolve();
        }

        let abi = contract.abi,
            constant,
            payable,
            inputs = [];

        abi.map((item, index) => {
            if (item.name == contractFnName) {
                constant = item.constant;
                payable = item.payable;
                inputs = item.inputs;
            }
        })

        this.runStart(contractAddress, contractFnName, constant, payable);
        if (constant) {
            try {
                //加上from
                argumentList.push({
                    from: this.user.address
                });
                let result = contract[contractFnName].apply(null, argumentList);

                console.log("result:\n", result);

                if (isJson(result)) {
                    cb(JSON.parse(result));
                } else {
                    cb(result);
                }
                this.runFinish(contractAddress,{
                    result: result,
                })
            } catch (e) {
                console.warn(e);
                this.runFailure(e);
                cb(e);
            }
            this.getContractLog(this.provider, contractAddress, this.getQueryTime());
            this.getBackgroundLog(this.provider, this.queryBackgroundTime)
        } else {
            let data = '';
            debugger;
            argumentList = dealArgumentList(argumentList);

            try {
                if (isArray(argumentList)) { //数组
                    data = contract[contractFnName].getData.apply(null, argumentList);
                } else if (typeof argumentList == 'string') { //字符串
                    data = contract[contractFnName].getData(argumentList);
                } else {
                    console.warn('argumentList参数类型不正确！！！');
                }
            } catch (error) {
                console.error(error);
                this.runFailure(error);
                return false;
            }

            console.log('data', data)
            const txParams = {
                //from就是钱包地址，但是用私钥签名后，钱包地址可以通过签名得到公钥再通过公钥得到钱包地址 不用传
                //from: this.user.address,
                //防重 每次都生成一个新的nonce，用过之后就失效了
                nonce: this.web3.nonce(),
                gasPrice: 21000000000,
                gasLimit: 843314949521407,
                to: contract.address,
                value: 0,
                data: data,
            }; //签名后的数据

            this.sign(txParams).then((serializedTxHex) => {
                let hash = this.web3.eth.sendRawTransaction(serializedTxHex); //交易的哈希
                //let hash =this.web3.eth.sendTransaction(txParams)
                this.callbacks[hash] = {
                    cb: cb,
                    wrapCount: this.wrapCount,
                }
                this.getContractLog(this.provider, contractAddress, this.queryTime);
                this.getBackgroundLog(this.provider,this.queryBackgroundTime)
                this.getTransactionReceipt(hash,contractAddress);
            });
        }
    }

    /*
     *  查询合约
     *
     */
    queryContract(contractAddress, abi) {
        //16进制 需要加上0x
        contractAddress.substring(0, 2) == '0x' ? "" : contractAddress = '0x' + contractAddress;

        if (!this.web3.isAddress(contractAddress)) {
            this.queryFailure('无效合约地址');
            return false;
        }

        if (isString(abi)) {
            try {
                abi = JSON.parse(abi)
            } catch (error) {
                console.warn(error);
                this.queryFailure(error.message);
                return false;
            }
        }
        const code = this.web3.eth.getCode(contractAddress);
        if (code !='0x') {
            try {
                let contractABI = this.web3.eth.contract(abi),
                    contractInstance = contractABI.at(contractAddress);

                this.data[contractAddress] = {
                    contractAddress: contractAddress,
                    from: '',
                    fileName: '',
                    contractName: '',
                    contract: contractInstance,
                };
                return contractInstance;
            } catch (error) {
                console.warn(error);
                this.queryFailure(error);
                return false;
            }
        } else {
            this.queryFailure('查询结果为空');
            return false;

        }

    }

    queryFailure(msg) {
        consoleService.output('[查询失败]', {
            logError: 'query failure'
        }, {
            logError: msg
        });
        return true;
    }

    runStart(contractAddress, contractFnName, constant, payable) {
        consoleService.output('[开始运行]', `Function [${contractFnName}] invoking...`, 'Invoke args:', {
            From: this.user.address,
            to: contractAddress,
            constant: constant,
            payable: payable,
        });
    }

    runFinish(contractAddress,result) {
        this.getContractLog(this.provider, contractAddress, this.queryTime);
        this.getBackgroundLog(this.provider)
        consoleService.output('[运行结果]', 'Invoke finish', result);
    }

    runFailure(err) {
        consoleService.output('[运行失败]', {
            logError: 'Invoke failure'
        }, {
            logError: err.message
        });
        return true;
    }

    getTransactionReceipt(hash,contractAddress) {
        console.log('getTransactionReceipt hash==>', hash);
        let id = '',
            result = this.web3.eth.getTransactionReceipt(hash),
            data = {};

        if (result && result.transactionHash && hash == result.transactionHash) {
            console.log('getTransactionReceipt.result=', result)
            clearTimeout(id);
            this.runFinish(contractAddress,result);
            this.callbacks[hash].cb(result);
            delete this.callbacks[hash];
        } else {
            if (this.callbacks[hash].wrapCount--) {
                console.log(this.wrapCount - this.callbacks[hash].wrapCount);
                id = setTimeout(() => {
                    this.getTransactionReceipt(hash,contractAddress);
                }, 1000);
            } else {
                this.runFinish(contractAddress,'查询sendRawTrasaction结果超时');
                this.callbacks[hash].cb(1000, '超时');
                console.warn('sendRawTrasaction超时');
                id = '';
                delete this.callbacks[hash];
            }
        }
    }

    sign(txParams) {
        //调试用
        // return new Promise((resolve, reject) => {
        //     let tx = new EthereumTx(txParams);
        //     console.log('txParams', txParams);
        //     //钱包签名
        //     let privateKey = Buffer.from(this.user.privateKey, 'hex');
        //     tx.sign(privateKey);
        //     const serializedTx = tx.serialize(),
        //         serializedTxHex = "0x" + serializedTx.toString('hex');
        //     resolve(serializedTxHex);
        // })

        return new Promise((resolve, reject) => {
            Juice.wallet.sign(txParams, (res) => {
                if (res.code == 0) {
                    resolve(res.data);
                } else {
                    consoleService.output('[签名失败]', {
                        logError: res.msg
                    });
                }
            })
        })
    }

    //获取要查询的时间
    getQueryTime() {
        const desendMinutes = (date, minutes) => {
            minutes = parseInt(minutes);
            let interTimes = minutes * 60 * 1000;
            interTimes = parseInt(interTimes);
            return new Date(Date.parse(date) - interTimes);
        }
        console.log(desendMinutes(new Date, 5))
        return this.queryTime ? this.queryTime : desendMinutes(new Date, 5);
    }

    getContractLog(nodeId, contractAddress, queryTime) {
        let params = {
            "_source": ["address", "ip", "message","@timestamp" ],
            "query": {
                "bool": {
                    "must": [{
                            "term": {
                                "address": contractAddress
                            }
                        },
                        {
                            "term": {
                                "ip": nodeId.substring(nodeId.indexOf('//') + 2, nodeId.lastIndexOf(':'))
                            }
                        }
                    ],
                    "must_not": [],
                    "should": []
                }
            },
            "from": 0,
            "size": queryTime ? 1000 : 1,
            "sort": [{
                "@timestamp": {
                    "order": "desc"
                }
            }],
            "aggs": {}
        }

        if (queryTime) {
            params.query.bool.filter = {
                "range": {
                    "@timestamp": {
                        "gt": queryTime
                    }
                }
            }
        }
        console.log('getContractLog',JSON.stringify(params))
        APIServies.log.search(params).then((res) => {
            console.log(res.hits.hits);
            if (res && res.hits.hits.length > 0) {
                let arr = res.hits.hits;
                arr.map((item, index) => {
                    consoleService.output('[合约日志]', {
                        ip: item._source.ip,
                        //time: item._source['@timestamp'],
                        address: item._source.address,
                        message: item._source.message,
                    });
                    this.queryTime = item._source['@timestamp'];
                })
            }
        })
    }

    getBackgroundLog(nodeId, queryTime) {
        let address = this.user.address.substring(0, 2) == '0x' ? this.user.address.substr(2) : this.user.address,
            message = `*${address}*`;
        let params = {
            "_source": [
                "message",
                "logdate",
                "@timestamp",
                "ip"
            ],
            "query": {
                "wildcard": {
                    "message": message,
                }
            },
            "from": 0,
            "size": queryTime ? 1000 : 1,
            "sort": [
                {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            ],
            "aggs": {}
        }

        if (queryTime) {
            params.query =  {
                "bool": {
                  "must": [
                    {
                        "wildcard": {
                            "message": message
                        }
                    },
                    {
                        "term": {
                            "ip": nodeId.substring(nodeId.indexOf('//') + 2, nodeId.lastIndexOf(':'))
                        }
                    }
                  ],
                  "must_not": [],
                  "should": [],
                  "filter": {
                    "range": {
                      "@timestamp": {
                        "gt": queryTime
                      }
                    }
                  }
                }
              };
        }
        console.log('getBackgroundLog',JSON.stringify(params))
        APIServies.log.juethSearch(params).then((res) => {
            console.log('getBackgroundLog res', res)
            if (res && res.hits.hits.length > 0) {
                let arr = res.hits.hits;
                if (this.queryBackgroundTime) {
                    if (arr.length != 0) {
                        arr.reverse();
                        consoleService.output('[系统日志]');
                        arr.map((item, index) => {
                            this.queryBackgroundTime = item._source['@timestamp'];
                            consoleService.output(item._source.message);
                        });
                    }
                } else {
                    this.queryBackgroundTime = arr[arr.length - 1]._source['@timestamp'];
                }

            }
        })
    }
}

//导出一个类
export default new DeployService;