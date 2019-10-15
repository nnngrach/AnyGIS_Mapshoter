
// Очередь, состоящая из обрабатываемых и обработанных супер-тайлов
// Пример: {"nakarte/12/12": false}
var queue = {}

// Геттеры и сеттеры
function isTaskInQueue (bigTileName) {
  return bigTileName in queue
}

function addTask(bigTileName) {
  queue[bigTileName] = false
}

function checkTaskStatus(bigTileName) {
  return queue[bigTileName]
}

function setTaskStatus(bigTileName, isDone) {
  queue[bigTileName] = isDone
}


//module.exports.queue = queue
module.exports.isTaskInQueue = isTaskInQueue
module.exports.addTask = addTask
module.exports.checkTaskStatus = checkTaskStatus
module.exports.setTaskStatus = setTaskStatus
