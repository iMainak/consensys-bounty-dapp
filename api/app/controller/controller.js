var config = require('config.json')
var ethers = require('ethers');
var contractArtifacts = require('../../../dapp/build/contracts/Bounty.json')
var userModel = require('../models/user.model.js')
var userManagment = require('./user.controller.js')
const {
    ipfsService
} = require('../lib/ipfs.js');
const fs = require('fs');
const mkdirp = require('mkdirp');

contractAddress = contractArtifacts.networks['' + config.blockchainNetworkId]['address'];
contractABI = contractArtifacts.abi;

provider = new ethers.providers.JsonRpcProvider(config.blockchainDeploymentpath, {
    chainId: config.blockchainNetworkId
});

adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
adminContract = new ethers.Contract(contractAddress, contractABI, adminWallet)

const createNewAccount = () => {
    new_account = ethers.Wallet.createRandom();
    return new_account;
}

const getBalance = (address) => {
    return new Promise((res, rej) => {
        provider.getBalance(address).then(data => {
            res(data.toString())
        }).catch(err => {
            rej(err)
        })
    })
}

const sendBalance = (address) => {
    return new Promise((res, rej) => {
        adminWallet.sendTransaction({
            to: address,
            value: ethers.utils.parseEther("100.0")
        }).then(data => {
            res(data)
        }).catch(err => {
            rej(err)
        })
    })
}

const checkBalanceUpdate = (address) => {
    return new Promise((res, rej) => {
        balance = await getBalance(address)
        if (parseInt(bal) == 0) {
            setTimeout(() => {
                checkBalanceUpdated(address).then(((result) => {
                    res(result);
                }));
            }, 1000);
        } else {
            console.log("balance is now: ", bal, "stopping");
            resolve(true);
        }
    })
}

exports.registerPublisher = (req, res) => {
    publisher_details = {}
    publisher_details.id = req.body.id
    publisher_details.name = req.body.name
    publisher_details.email = req.body.email
    publisher_details.password = req.body.password

    account_details = {}
    account_details.id = req.body.id
    account_details.role = "Publisher"
    account_details.email = req.body.id
    account_details.password = req.body.id
    ipfsService.add(publisher_details).then(hash => {
        new_account = createNewAccount();
        newWallet = new ethers.Wallet(new_account.privateKey, provider);
        sendBalance(new_account.address).then(data => {
            getBalance(new_account.address).then(data => {
                checkBalanceUpdate(new_account.address).then(data => {
                    account_details.privateKey = new_account.privateKey
                    account_details.account_address = new_account.address
                    target_path = './uploads/publisher' + req.body.id
                    mkdirp(target_path, (err) => {
                        if (err) console.error(err)
                        else {
                            userManagment.create(account_details).then(data => {
                                userContract = new ethers.Contract(contractAddress, contractABI, newWallet);
                                userContract.registerPublisher(hash[0].hash).then(data => {

                                    var obj = {
                                        table: []
                                    }
                                    obj.table.push({
                                        id: req.body.id,
                                        hash: data.hash
                                    })
                                    var str = JSON.stringify(obj);
                                    fs.writeFile(target_path + '/file.json', str, 'utf8', (err) => {
                                        if (err) {
                                            console.log('there was an error: ', err);
                                            return;
                                        }
                                        console.log('data was appended to file');
                                    });

                                    res.send(data);
                                }).catch(err => {
                                    console.error(err)
                                })
                            }).catch(err => {
                                console.error(err)
                            })
                        }
                    })
                }).catch(err => {
                    console.error(err)
                })
            }).catch(err => {
                console.error(err)
            })
        }).catch(err => {
            console.error(err)
        })
    }).catch(err => {
        console.error(err)
    })
}

exports.registerApplier = (req, res) => {
    applier_details = {}
    applier_details.id = req.body.id
    applier_details.name = req.body.name
    applier_details.email = req.body.email
    applier_details.password = req.body.password

    account_details = {}
    account_details.id = req.body.id
    account_details.role = "Applier"
    account_details.email = req.body.email
    account_details.password = req.body.password

    ipfsService.add(applier_details).then(hash => {
        new_account = createNewAccount()
        newWallet = new ethers.Wallet(new_account.privateKey, provider);
        sendBalance(new_account.address).then(data => {
            getBalance(new_account.address).then(data => {
                checkBalanceUpdate(new_account.address).then(data => {
                    account_details.privateKey = new_account.privateKey
                    account_details.account_address = new_account.address
                    target_path = './uploads/applier' + req.body.id
                    mkdirp(target_path, (err) => {
                        if (err) console.error(err)
                        else {
                            userManagment.create(account_details).then(data => {
                                userContract = new ethers.Contract(contractAddress, contractABI, newWallet);
                                userContract.registerApplier(hash[0].hash).then(data => {

                                    var obj = {
                                        table: []
                                    }
                                    obj.table.push({
                                        id: req.body.id,
                                        hash: data.hash
                                    })
                                    var str = JSON.stringify(obj);
                                    fs.writeFile(target_path + '/file.json', str, 'utf8', (err) => {
                                        if (err) {
                                            console.log('there was an error: ', err);
                                            return;
                                        }
                                        console.log('data was appended to file');
                                    });

                                    res.send(data);
                                }).catch(err => {
                                    console.error(err)
                                })
                            }).catch(err => {
                                console.error(err)
                            })
                        }
                    })

                }).catch(err => {
                    console.error(err)
                })
            }).catch(err => {
                console.error(err)
            })
        }).catch(err => {
            console.error(err)
        })
    }).catch(err => {
        console.error(err)
    })
}

exports.addBounty = (req, res) => {
    bounty_details = {}

    bounty_id = req.body.id

    publisher_id = req.body.publisher_id
    target_path = './uploads/publisher' + publisher_id
    if (!fs.existsSync(target_path)) {
        console.log('Publisher Not registered')
        res.status(400).send({
            message: "Publisher Not Registered"
        })
    }
    else {
        target_path1 = target_path + '/' + bounty_id;
        mkdirp(target_path1, err => {
            if (err) console.error(err)

            else {
                description = req.files.description
                description_path = target_path1
                fs.writeFileSync(description_path, description.data, 'binary')
                bounty_details.description = description_path
                bounty_details.submissionDate = req.body.submissionDate
                bounty_details.amount = req.body.amount

                ipfsService.add(bounty_details).then(hash => {
                    bounty_ID = ethers.utils.formatBytes32String(bounty_id)
                    wallet = new ethers.Wallet(req.privateKey, provider);
                    contract = new ethers.Contract(contractAddress, contractABI, wallet);
                    contract.addBounty(bounty_ID, hash[0].hash, 0).then(data => {

                        fs.readFile(target_path + '/file.json', 'utf8', function readFileCallback(err, data1) {
                            if (err) {
                                console.log(err);
                            } else {
                                obj = JSON.parse(data1); //now it an object
                                obj.table.push({ id: bounty_ID, hash: data.hash, conclusion: "Bounty Added" }); //add some data
                                var str = JSON.stringify(obj);
                                fs.writeFile(target_path + '/file.json', str, 'utf8', (err) => {
                                    if (err) console.error(err)
                                    console.log("Suuccess")
                                });
                            }
                        });

                        res.send(data)
                    }).catch(err => {
                        console.error(err)
                    })
                }).catch(err => {
                    console.error(err)
                })
            }
        })
    }
}

exports.addAnswerForBounty = (req, res) => {
    bounty_id = req.body.bounty_id
    applier_id = req.body.applier_id
    target_path = './uploads/applier' + applier_id
    if (!fs.existsSync(target_path)) {
        console.log("Applier Not Registered")
        res.status(400).send({
            message: "Applier Not Registered"
        })
    }
    else {
        target_path1 = target_path + '/' + bounty_id
        mkdirp(target_path1, err => {
            if (err) console.error(err)
            else {
                solution = req.files.solution
                solution_path = target_path1
                fs.writeFileSync(solution_path, solution.data, 'binary')

                bounty_ID = ethers.utils.formatBytes32String(bounty_id)
                wallet = new ethers.Wallet(req.privateKey, provider);
                contract = new ethers.Contract(contractAddress, contractABI, wallet);
                contract.addAnswerForBounty(bounty_ID, solution_path, 0).then(data => {

                    fs.readFile(target_path + '/file.json', 'utf8', function readFileCallback(err, data1) {
                        if (err) {
                            console.log(err);
                        } else {
                            obj = JSON.parse(data1); //now it an object
                            obj.table.push({ id: bounty_ID, hash: data.hash, conclusion: "Submit Answer" }); //add some data
                            var str = JSON.stringify(obj);
                            fs.writeFile(target_path + '/file.json', str, 'utf8', (err) => {
                                if (err) console.error(err)
                                console.log("Suuccess")
                            });
                        }
                    });

                    res.send(data)
                }).catch(err => {
                    console.error(err)
                })
            }
        })
    }
}

exports.addBountyToApplier = (req, res) => {
    bounty_id = req.body.bounty_id
    publisher_id = req.body.publisher_id
    applier_address = req.body.applier_address

    target_path = './uploads/publisher' + publisher_id

    bounty_ID = ethers.utils.formatBytes32String(bounty_id)
    wallet = new ethers.Wallet(req.privateKey, provider);
    contract = new ethers.Contract(contractAddress, contractABI, wallet);
    contract.addBountyToApplier(bounty_ID, applier_address, 0).then(data => {
        fs.readFile(target_path, './file.json', 'utf8', function readFileCallback(err, data1) {
            if (err) console.error(err)
            else {
                obj = JSON.parse(data1);
                obj.table.forEach(element => {
                    if (element.id !== bounty_ID) {
                        res.status(400).send({
                            message: "Bounty ID not registered"
                        })
                    }
                    else {
                        element.updatedHash = data.hash
                        element.ApplierAddress = applier_address
                        var str = JSON.stringify(obj);
                        fs.writeFile(fileName, str, 'utf8', (err) => {
                            if (err) console.error(err)
                            console.log("Suuccess")
                        });
                    }
                })
            }
        })
        res.send(data)
    })
}
const sendEthers = (publisher_address, publisher_privateKey, amount, applier_address) => {
    return new Promise((res, rej) => {
        getBalance(publisher_address).then(data => {
            provider_wallet = new ethers.Wallet(publisher_privateKey, provider);
            provider_wallet.sendTransaction({
                to: address,
                value: ethers.utils.parseEther(amount)
            }).then(data => {
                checkBalanceUpdate(applier_address).then(data => {
                    res(data)
                })
            }).catch(err => {
                console.error(err)
            })
        }).catch(err => {
            console.error(err)
        })
    })
}

exports.giveAmountToApplier = (req, res) => {
    bounty_id = req.body.bounty_id
    publisher_address = req.body.publisher_address
    publisher_privateKey = req.body.publisher_privateKey
    amount = req.body.amount
    applier_address = req.body.applier_address
    sendEthers(publisher_address, publisher_privateKey, amount, applier_address).then(data => {
        bounty_ID = ethers.utils.formatBytes32String(bounty_id)
        wallet = new ethers.Wallet(req.privateKey, provider);
        contract = new ethers.Contract(contractAddress, contractABI, wallet);
        contract.giveAmountToApplier(bounty_ID, amount, applier_address).then(data => {
            res.send(data)
        })
    })
}
// GET Function
exports.getPublisherDetails = (req, res) => {
    publisher_address = req.body.publisher_address
    adminContract.getPublisherDetails(publisher_address).then(hash => {
        ipfsService.cat(hash).then(data => {
            res.send(data)
        })
    })
}

exports.getApplierDetails = (req, res) => {
    applier_address = req.body.applier_address;
    adminContract.getApplierDetails(applier_address).then(hash => {
        ipfsService.cat(hash).then(data => {
            res.send(data)
        })
    })
}

exports.getAllBountys = (req, res) => {
    publisher_address = req.body.publisher_address
    adminContract.getAllBountys(publisher_address).then(data => {
        res.send(data)
    })
}

exports.getBountysDetails = (req, res) => {
    bounty_id = req.body.bounty_id
    bounty_ID = ethers.utils.formatBytes32String(bounty_id)
    adminContract.getBountysDetails(bounty_ID).then(data => {
        res.send(data)
    })
}

exports.getBountyAnswerDetails = (req, res) => {
    answer_id = req.body.answer_id
    adminContract.getBountyAnswerDetails(answer_id)
}