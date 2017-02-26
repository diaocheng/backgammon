var chess = document.getElementById('chess');
// 设置宽高
chess.width = 450;
chess.height = 450;
// 获取绘图上下文
var context = chess.getContext('2d');
// 获得棋盘落子点矩阵
var chessboard = [];
for (var i = 0; i < 15; i++) {
    chessboard[i] = [];
    for (var j = 0; j < 15; j++) {
        chessboard[i][j] = 0;
    }
}

// 所有的赢法数组
var wins = [];
for (var i = 0; i < 15; i++) {
    wins[i] = [];
    for (var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}
// 赢法统计
var count = 0;
// 所有的横线赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        // 第0种赢发
        // wins[0][0][0] = true;
        // wins[0][1][0] = true;
        // wins[0][2][0] = true;
        // wins[0][3][0] = true;
        // wins[0][4][0] = true;
        // 第1种赢发
        // wins[0][1][1] = true;
        // wins[0][2][1] = true;
        // wins[0][3][1] = true;
        // wins[0][4][1] = true;
        // wins[0][5][1] = true;
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
// 所有的竖线赢法
for (var i = 0; i < 15; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
// 所有的斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i + k][count] = true;
        }
        count++;
    }
}
// 所有的反斜线赢法
for (var i = 0; i < 11; i++) {
    for (var j = 14; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

var ME = [];
var AI = [];
// 记录ME与AI的每一种赢发的概率
for (var i = 0; i < count; i++) {
    ME[i] = 0;
    AI[i] = 0;
}

// 画棋盘
drawChessBoard();

// 记录当前落棋方是否为AI
var ISAI = false;
// 判断游戏是否结束
var gameover = false;
// 点击落子
chess.addEventListener('click', function(e) {
    if (gameover) {
        return;
    }
    // 不是AI就不执行
    // 必须等到AI下完之后才行
    if (ISAI) {
        return;
    }
    var x = Math.round((e.offsetX - 15) / 30);
    var y = Math.round((e.offsetY - 15) / 30);
    // 判断当前点是否可以落子
    if (chessboard[x][y] === 0) {
        drawChess(x, y, ISAI);
        chessboard[x][y] = 1;
        ISAI = !ISAI;
        for (var i = 0; i < count; i++) {
            if (wins[x][y][i]) {
                // 增加本种赢法概率
                ME[i]++;
                // AI的此种赢法不可能实现了
                AI[i] = false;
                if (ME[i] === 5) {
                    gameover = true;
                    alert('你已经赢了');
                }
            }
        }
    }
    // 游戏没有结束就让AI下
    if (!gameover) {
        AIstep();
    }
});

// 绘制棋盘函数
function drawChessBoard() {
    // 设置画笔颜色
    context.strokeStyle = '#ababab';
    // 绘制棋盘网格
    for (var i = 0; i < 15; i++) {
        // 绘制水平线
        // 15为边框边距
        context.moveTo(15, i * 30 + 15);
        context.lineTo(435, i * 30 + 15);
        context.stroke();
        // 绘制垂直线
        // 15为边框边距
        context.moveTo(i * 30 + 15, 15);
        context.lineTo(i * 30 + 15, 435);
        context.stroke();
    }
}
// 绘制棋子
function drawChess(x, y, ISAI) {
    x = 15 + x * 30;
    y = 15 + y * 30;
    context.beginPath();
    // 画圆形
    context.arc(x, y, 13, 0, 2 * Math.PI);
    // 填充样式过渡效果
    // 渐变中心向右下角偏移
    var gradient = context.createRadialGradient(x + 2, y + 2, 13, x + 2, y + 2, 0);
    // 判断棋子样式
    if (ISAI) {
        gradient.addColorStop(0, '#cccccc');
        gradient.addColorStop(1, '#ffffff');
    } else {
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#777777');
    }
    // 填充色
    context.fillStyle = gradient;
    context.closePath();
    // 填充
    context.fill();
}

// AI下棋
function AIstep() {
    var MEscore = [];
    var AIscore = [];
    for (var i = 0; i < 15; i++) {
        MEscore[i] = [];
        AIscore[i] = [];
        for (var j = 0; j < 15; j++) {
            MEscore[i][j] = 0;
            AIscore[i][j] = 0;
        }
    }
    // 最高分及其出现的坐标
    var x = 0;
    var y = 0;
    var maxscore = 0;
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            // 判断棋盘这个位置是否可以落子
            if (chessboard[i][j] === 0) {
                for (var k = 0; k < count; k++) {
                    // 在i,j位置有棋子
                    if (wins[i][j][k]) {
                        // 计算拦截价值
                        if (ME[k] === 1) {
                            MEscore[i][j] += 100;
                        } else if (ME[k] === 2) {
                            MEscore[i][j] += 200;
                        } else if (ME[k] === 3) {
                            MEscore[i][j] += 1000;
                        } else if (ME[k] === 4) {
                            MEscore[i][j] += 4000;
                        }
                        // 计算自己完成的价值
                        if (AI[k] === 1) {
                            AIscore[i][j] += 120;
                        } else if (AI[k] === 2) {
                            AIscore[i][j] += 220;
                        } else if (AI[k] === 3) {
                            AIscore[i][j] += 1200;
                        } else if (AI[k] === 4) {
                            AIscore[i][j] += 10000;
                        }
                    }
                }
                if (maxscore < MEscore[i][j]) {
                    maxscore = MEscore[i][j];
                    x = i;
                    y = j;
                } else if (maxscore === MEscore[i][j]) {
                    if (AIscore[i][j] > AIscore[x][y]) {
                        x = i;
                        y = j;
                    }
                }
                if (maxscore < AIscore[i][j]) {
                    maxscore = AIscore[i][j];
                    x = i;
                    y = j;
                } else if (maxscore === AIscore[i][j]) {
                    if (MEscore[i][j] > MEscore[x][y]) {
                        x = i;
                        y = j;
                    }
                }
            }
        }
    }
    drawChess(x, y, true);
    chessboard[x][y] = 2;
    for (var i = 0; i < count; i++) {
        if (wins[x][y][i]) {
            // 增加本种赢法概率
            AI[i]++;
            // AI的此种赢法不可能实现了
            ME[i] = false;
            if (AI[i] === 5) {
                gameover = true;
                alert('AI已经赢了，再接再厉！');
            }
        }
    }
    if (!gameover) {
        ISAI = !ISAI;
    }
}