# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.12.0](https://github.com/Infomaximum/frontend-builder/compare/v1.11.0...v1.12.0) (2025-01-13)


### Features

* добавлена возможность проксировать запросы из собранного билда на удаленный сервер ([bdcda1e](https://github.com/Infomaximum/frontend-builder/commit/bdcda1e1d67379e3a9b9b409dd93a3f2c55bbcb1))

## [1.11.0](https://github.com/Infomaximum/frontend-builder/compare/v1.10.0...v1.11.0) (2024-09-18)


### Features

* добавлена возможность импортировать svg в исходном виде ([99ac0aa](https://github.com/Infomaximum/frontend-builder/commit/99ac0aa11b26787d88918b737034d8bbcdb217bd))

## [1.10.0](https://github.com/Infomaximum/frontend-builder/compare/v1.9.1...v1.10.0) (2024-09-13)


### Features

* добавлено reportFilename для BundleAnalyzerPlugin ([d7b3cf4](https://github.com/Infomaximum/frontend-builder/commit/d7b3cf43f545206d51b9f7720e36e9d5f63daf46))

### [1.9.1](https://github.com/Infomaximum/frontend-builder/compare/v1.9.0...v1.9.1) (2024-08-27)


### Bug Fixes

* убрано извлечение комментариев в файлы .txt ([66a82bb](https://github.com/Infomaximum/frontend-builder/commit/66a82bbeca5ba1c26a1354f6f996b8455177820d))

## [1.9.0](https://github.com/Infomaximum/frontend-builder/compare/v1.8.1...v1.9.0) (2024-08-12)


### Features

* splitChunks по умолчанию ([aec7f6a](https://github.com/Infomaximum/frontend-builder/commit/aec7f6a9f5615592ab00fa0936fc80fa49a428ee))


### Bug Fixes

* исправлено падение сборки при отсутствии git репозитория ([476eb6e](https://github.com/Infomaximum/frontend-builder/commit/476eb6e309fd629bc19862c0208a13c3a992f7e6))

### [1.8.1](https://github.com/Infomaximum/frontend-builder/compare/v1.8.0...v1.8.1) (2024-06-12)


### Bug Fixes

* maxGenerations -> 1 ([b231e59](https://github.com/Infomaximum/frontend-builder/commit/b231e5981a5526c7ac5a7d9d93b14f9898d94e25))

## [1.8.0](https://github.com/Infomaximum/frontend-builder/compare/v1.7.0...v1.8.0) (2024-06-12)


### Features

* добавлен url для снятия снапшотов кучи ([d703c29](https://github.com/Infomaximum/frontend-builder/commit/d703c296e306c918c57a8d1e237f89a53e7854f0))

## [1.7.0](https://github.com/Infomaximum/frontend-builder/compare/v1.6.1...v1.7.0) (2024-06-11)


### Features

* добавлены варианты значений в опцию cache ([b65c7b5](https://github.com/Infomaximum/frontend-builder/commit/b65c7b55865a7a3c635a714261725d581fa4f19e))

### [1.6.1](https://github.com/Infomaximum/frontend-builder/compare/v1.6.0...v1.6.1) (2024-06-11)


### Bug Fixes

* исправлено имя библиотеки ([334750e](https://github.com/Infomaximum/frontend-builder/commit/334750e0fb97a17741dab259efc4745d4c7724b8))

## [1.6.0](https://github.com/Infomaximum/frontend-builder/compare/v1.5.0...v1.6.0) (2024-06-11)


### Features

* добавлена возможность указать тип кеша webpack ([e43ecb8](https://github.com/Infomaximum/frontend-builder/commit/e43ecb8b15f04692cadfc1ed3516e852800bef7f))


### Bug Fixes

* MiniCssExtractPlugin только при сборке в прод (исправлена утечка памяти) ([eaf2bb5](https://github.com/Infomaximum/frontend-builder/commit/eaf2bb541b0349c7993c9ddc099bdeddef078f33))

## [1.5.0](https://github.com/Infomaximum/frontend-builder/compare/v1.4.0...v1.5.0) (2024-06-10)


### Features

* увеличен лимит памяти ForkTsCheckerWebpackPlugin ([7f0945d](https://github.com/Infomaximum/frontend-builder/commit/7f0945d8f11596d675c13626c1d807e61a2de7f5))


### Bug Fixes

* останавливается выполнение программы при ошибке выборе порта ([2d912c8](https://github.com/Infomaximum/frontend-builder/commit/2d912c883a500136fb613d5557ea021452c657ef))

## [1.4.0](https://github.com/Infomaximum/frontend-builder/compare/v1.3.0...v1.4.0) (2024-05-30)


### Features

* futureDefaults ([4431d3e](https://github.com/Infomaximum/frontend-builder/commit/4431d3e3ea6f127ece366845b5899fb7adcfa597))

## [1.3.0](https://github.com/Infomaximum/frontend-builder/compare/v1.2.1...v1.3.0) (2024-05-29)


### Features

* добавлена возможность проксирования запросов без указания порта ([955280a](https://github.com/Infomaximum/frontend-builder/commit/955280aa02f1eb6b20a0beb0068d7bd87e9938d4))

### [1.2.1](https://github.com/Infomaximum/frontend-builder/compare/v1.2.0...v1.2.1) (2024-03-13)


### Bug Fixes

* увеличен лимит памяти ([b6555c2](https://github.com/Infomaximum/frontend-builder/commit/b6555c263a878937ac0a28cdab60e1a1a0759a7e))

## [1.2.0](https://github.com/Infomaximum/frontend-builder/compare/v1.1.1...v1.2.0) (2024-03-06)


### Features

* добавлено проксирование с /saml_auth ([97c2ba6](https://github.com/Infomaximum/frontend-builder/commit/97c2ba6679d3e90f0c9272aec8bdcc1a4f3a0f70))

### [1.1.1](https://github.com/Infomaximum/frontend-builder/compare/v1.1.0...v1.1.1) (2023-10-04)


### Bug Fixes

* cacheGroups node_modules ([26a10a4](https://github.com/Infomaximum/frontend-builder/commit/26a10a425e6dee15e7b24b41d77e3427898bb10c))

## [1.1.0](https://github.com/Infomaximum/frontend-builder/compare/v1.0.3...v1.1.0) (2023-04-19)


### Features

* добавлен badge ([183b985](https://github.com/Infomaximum/frontend-builder/commit/183b98506f36bf66361d13544f2566ed9e05d9b2))


### Bug Fixes

* исправлена проблема с отсутствием core-js ([7d91bf2](https://github.com/Infomaximum/frontend-builder/commit/7d91bf20014c2e0e9286215437e589d451dd2255))

### 1.0.3 (2023-03-23)


### Bug Fixes

* исправлено описание библиотеки ([291b275](https://github.com/Infomaximum/frontend-builder/commit/291b27529f1a0b7d8c1a6732b4e27ed0e8801f88))

### [1.0.2](https://git.office.infomaximum.com:10122/frontend/im-builder/compare/v1.0.1...v1.0.2) (2023-03-23)


### Bug Fixes

* исправил форматирование вывода ошибок ([e72627e](https://git.office.infomaximum.com:10122/frontend/im-builder/commit/e72627ea040e8a0fc3d8b16c648dde71cc579c31))

### 1.0.1 (2023-03-21)
