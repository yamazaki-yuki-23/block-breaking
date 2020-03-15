enchant();

//定数
SPEED_UP = 0.5; //ボールのスピードアップ量
BALL_SX = 0; //ボールの出現位置のX座標
BALL_SY = 108; //ボールの出現位置のY座標

window.onload = function() {

    core = new Core(320, 320);
    core.fps = 16;

    //ライフ数(ボール数)を格納するプロパティ
    core.life = 3;
    //スコアを格納するプロパティ
    core.score = 0;

    //面クリアフラグ(1面をクリアしたかどうかの状態を表す)
    core.clear = true;
    //コンボ数を格納するプロパティ
    core.combo = 1;

    core.onload = function() {

        //バックグラウンドのスプライトを作成する
        var bg = new Sprite(320, 320);
        //バックグラウンドの背景色を灰色に設定
        bg.backgroundColor = "#707070";
        core.rootScene.addChild(bg);

        //ブロックを格納する配列を定義する
        blocks = [];

        //ボールのスプライトを作成する
        //引数は、ボールの出現位置のxy座標
        var ball = new Ball(BALL_SX, BALL_SY);

        //パドルのスプライトを作成する
        //引数は、パドルの初期位置のxy座標
        var paddle = new Paddle(160 - 16, 320 - 32);

        //rootSceneの「enterframe」イベントリスナ
        core.rootScene.addEventListener('enterframe', function(e) {
            var key; //ブロックを格納する配列のインデックスキー
            //ブロックの色を定義した配列
            var colorptn = ['#0000ff', '#00ff00', '#ff0000', '#00ffff'];

            //面クリアフラグが[true」(1面をクリアした)なら、ブロックを生成して画面に配置する

            if(core.clear) {
                key = 0; //インデックスキーを「0」にする
                //5行5列でブロックを配置する
                for(var i = 0; i < 5; i++) {
                    for(var j = 0; j < 5; j++) {
                        //ブロックを作成する
                        var block = new Block(i * 64, j * 14 + 30, colorptn[i % 4]);
                        //「key」プロパティにインデックスキーを代入する
                        block.key = key;
                        //ブロックを配列に格納する
                        blocks[key] = block;
                        //インデックスキーをインクリメントする
                        key++;
                    }
                }

                //「blockCount」プロパティにインデックスキーの最終値(ブロックの総数)を代入する
                core.blockCount = key;
                //面クリアフラグを「false」にする
                core.clear = false;

                //ボールのxy方向の移動量を初期化する
                ball.vx = Math.abs(ball.vx);
                ball.vy = Math.abs(ball.vy);
            }

            //ボールとパドルの当たり判定
            if(ball.intersect(paddle)) {

                //ボールがパドルの左半分側に当たったなら
                if(ball.x >= paddle.x && (ball.x + ball.width / 2) <= (paddle.x + paddle.width / 2) ) {
                    //左斜め上方向にボールを打ち返されるようにする
                    if(ball.vx > 0) ball.vx *= -1;

                //ボールがパドルの右半分側に当たったなら
                }else {
                    //右斜め上方向にボールが打ち返されるようにする
                    if(ball.vx < 0) ball.vx *= -1;
                }

                //ボールのスピードをアップ
                ball.vy += SPEED_UP;
                if(ball.vx > 0) ball.vx += SPEED_UP;
                if(ball.vx < 0) ball.vy -= SPEED_UP;

                //ボールを打ち返す
                ball.vy *= -1;

                //コンボ数を初期化する
                core.combo = 1;
            }

            //ボールとブロックの当たり判定
            for(var i in blocks) {
                //ブロックにボールが当たったなら
                if(blocks[i].intersect(ball)) {
                    //スコアを加算する
                    core.score += 100 * core.combo;
                    //当たったブロックを消す
                    blocks[i].remove();
                    //ボールを打ち返す
                    ball.vy *= -1;
                    //ブロックの総数をデクリメントする
                    core.blockCount--+
                    //コンボ数(連続して消去されたブロック数)をカウントする
                    core.combo++;
                    //スコアの表示を更新する
                    scoreLabel.score = core.score;
                }
            }

            //面クリア処理

            //全ブロックを消去した([blockCount]プロパティの値が「0」以下)なら
            if(core.blockCount <= 0) {
                //面クリアフラグを「true」にする
                core.clear = true;
                //ボールのxy座標を初期化する
                ball.x = BALL_SX;
                ball.y = BALL_SY;
            }

            //空振りの処理

            //画面下より先に移動したなら
            if(ball.y > 320) {
                //ライフを1つ減らす
                lifeLabel.life = -- core.life;
                //ライフが残っているなら
                if(core.life > 0) {
                    //ボールを初期位置から発射する
                    ball.x = BALL_SX;
                    ball.y = BALL_SY;
                    ball.vx = ball.vy = 4;
                }else {
                    //ライフが残っていないならゲームオーバー
                    core.end();
                }
            }
        });

        //スコアをフォントで表示するラベルを作成する
        //引数はラベル表示位置のxy座標
        var scoreLabel = new ScoreLabel(5, 0);
        scoreLabel.score = 0; //初期値
        scoreLabel.easing = 0; //イージング設定
        core.rootScene.addChild(scoreLabel);

        //ライフをアイコンで表示するラベルを作成する
        //引数はラベル表示位置のxy座標とライフ数の初期値
        var lifeLabel = new LifeLabel(180, 0, 3);
        //各ライフに使用するアイコン画像のフレーム番号を設定する
        lifeLabel.heart[0].frame = 31;
        lifeLabel.heart[1].frame = 31;
        lifeLabel.heart[2].frame = 31;
        core.rootScene.addChild(lifeLabel);

    }
    core.start();
}

//ボールのスプライト作成するクラス
var Ball = enchant.Class.create(enchant.Sprite, {
    //「initialize」メソッド(コンストラクタ)
    initialize: function(x, y) {
        //継承元をコール
        enchant.Sprite.call(this, 8, 8);
        this.backgroundColor = "#FFFFFF"; //背景色
        this.x = x; //x座標
        this.y = y; //y座標
        this.speed; //スピード
        this.vx = 4; //x方向の移動量
        this.vy = 4; //y方向の移動量
        //「enterframe」イベントリスナ
        this.addEventListener('enterframe', function(e) {
            //ボールの移動処理
            this.x += this.vx;
            this.y += this.vy;
            //左右の壁に当たったなら、x方向の移動量の符号を反転する
            if(this.x > 320 -8 || this.x < 0) this.vx *= -1;
            //天井に当たったなら、y方向の移動量の符号を反転する
            if(this.y < 0) this.vy *= -1;
        });
        core.rootScene.addChild(this);
    },
    //「remove」メソッド
    remove: function() {
        //このスプライトを削除する
        delete this;
    }
});


//パドルのスプライトを作成するクラス
var Paddle = enchant.Class.create(enchant.Sprite, {
    //「initialize」メソッド(コンストラクタ)
    initialize: function(x, y) {
        //継承元をコール
        enchant.Sprite.call(this, 48, 8);
        this.backgroundColor = "#FFFFFF"; //背景色
        this.x = x; //x座標
        this.y = y; //y座標
        this.speed = 8; //スピード
        //「enterframe」イベントリスナ
        this.addEventListener('enterframe', function(e) {
            //左ボタンで左方向にパドルを移動する
            if(core.input.left && this.x > 0 - this.width / 2) {
                this.x -= this.speed;
            }
            //右ボタンで右方向にパドルを移動する
            if(core.input.right && this.x < 320 - this.width / 2) {
                this.x += this.speed;
            }
        });
        //タッチムーブでパドルを移動する
        this.addEventListener(Event.TOUCH_MOVE, function(e) {
            this.x = e.x;
        });
        core.rootScene.addChild(this);
    }
});

//ブロックのスプライトを作成するクラス
var Block = enchant.Class.create(enchant.Sprite, {
    //「initialize」メソッド(コンストラクタ)
    initialize: function(x, y, color) {
        //継承元をコール
        enchant.Sprite.call(this, 60, 10);
        this.backgroundColor = color; //背景色
        this.x = x; //x座標
        this.y = y; //y座標
        core.rootScene.addChild(this);
    },
    //「remove」メソッド
    remove: function() {
        //このスプライトをrootSceneから削除する
        core.rootScene.removeChild(this);
        //このキーのブロックを配列から削除する
        delete blocks[this.key];
        //このブロックを削除する
        delete this;
    }
});
