// dateデータを取得する
let dateRef = firebase.database().ref("date");
// nameデータを取得する
let nameRef = firebase.database().ref("name");
// fullデータを取得する
let fullRef = firebase.database().ref("full");
// baitデータを取得する
let baitRef = firebase.database().ref("bait");

// 変数の初期化
let today = new Date(); // 今日の日付
let full = 0; // 満腹度
let name = ""; //名前

// dateデータ
dateRef.on("value", function (data) {
  let year = data.child("startyear").val();
  let month = data.child("startmonth").val();
  let date = data.child("startdate").val();

  // データがnullではない場合の処理
  if (year != null && month != null && date != null) {
    let start = year + "年" + month + "月" + date + "日";

    // 育てた日数を調べる
    // s:育て始めた日
    let s = new Date(year, month, date);
    // t:今日の日付
    let t = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    // 差分を計算する
    let day = (t - s) / 86400000 + 1;

    // 日付の情報をHTMLに追記する
    $("#date").html(
      '<p class="date">育成を始めた日：' +
        start +
        '</p><p class="date">' +
        day +
        "日目</p>"
    );
  }
});

// nameデータ
nameRef.on("value", function (data) {
  let name = data.child("name").val();
  // 名前の情報をHTMLに追記する
  $("#name").html('<p class="name">名前：' + name + "</p>");
});

// fullデータ
fullRef.on("value", function (data) {
  full = data.child("full").val();
  // エサやりメソッドの呼び出し
  feedBait();
});

// baitデータ
baitRef.on("value", function (data) {
  let nowYear = data.child("baityear").val();
  let nowMonth = data.child("baitmonth").val();
  let nowDate = data.child("baitdate").val();
  let nowHours = data.child("baithours").val();
  let nowMinutes = data.child("baitminutes").val();
  let nowSeconds = data.child("baitseconds").val();

  // lastBait:最後のエサやりの時間
  let lastBait = new Date(
    nowYear,
    nowMonth,
    nowDate,
    nowHours,
    nowMinutes,
    nowSeconds
  );

  // now:今の時間
  let now = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds()
  );

  // 時間経過
  let time = Math.floor((now.getTime() - lastBait.getTime()) / 1000 / 60);

  // 最後にエサやりをしてから400分以上経ったら満腹度を0にする
  // 400分未満だったら20分毎に満腹度を5減らす
  if (400 <= time) {
    full = 0;
    // fullに満腹度のデータを格納する
    fullRef.set({
      full: full,
    });
  } else {
    for (let i = 0; i < time; i += 5) {
      if (20 <= i && i % 20 == 0) {
        if (5 <= full) {
          // 満腹度を5減らす
          full -= 5;
          // fullに満腹度のデータを格納する
          fullRef.set({
            full: full,
          });
        }
      }
    }
  }
});

// エサやりボタンを押したとき
$("#baitButton").on("click", function () {
  if (full < 100) {
    full += 5;
  }
  // ボタンを押した時間
  let day = new Date();
  let baitYear = day.getFullYear();
  let baitMonth = day.getMonth() + 1;
  let baitDate = day.getDate();
  let baitHours = day.getHours();
  let baitMinutes = day.getMinutes();
  let baitSeconds = day.getSeconds();

  // dateにエサやりした時間のデータを格納する
  baitRef.set({
    baityear: baitYear,
    baitmonth: baitMonth,
    baitdate: baitDate,
    baithours: baitHours,
    baitminutes: baitMinutes,
    baitseconds: baitSeconds,
  });
  // fullに満腹度のデータを格納する
  fullRef.set({
    full: full,
  });
  // エサやりメソッドの呼び出し
  feedBait();
});

// 新しく育てるボタンを押した時
$("#startButton").on("click", function () {
  // ボタンを押した日
  let day = new Date();
  let startYear = day.getFullYear();
  let startMonth = day.getMonth() + 1;
  let startDate = day.getDate();

  // dateに日付のデータを格納する
  dateRef.set({
    startyear: startYear,
    startmonth: startMonth,
    startdate: startDate,
  });

  // 名前をクラゲに設定する
  name = "クラゲ";
  // nameにデータを格納する
  nameRef.set({
    name: name,
  });

  // 満腹度を0に設定する
  full = 0;
  // fullにデータを格納する
  fullRef.set({
    full: full,
  });
});

// エサやりメソッド
function feedBait() {
  // 満腹度の情報をHTMLに追記する
  $("#full").html(
    '<p class="date">満腹度：<meter min="0" max="100" low="40" high="80" optimum="90" value=' +
      full +
      "></meter><p>"
  );
}

// 名前変更ボタンを押した場合
$("#nameButton").on("click", function () {
  // 入力ダイアログを表示 ＋ 入力内容を name に代入
  name = window.prompt("名前を入力してください", "");

  if (name != "" && name != null) {
    nameRef.set({
      name: name,
    });
  } else if (name == "" && name == null) {
    window.alert("名前を入力してください");
  } else {
    window.alert("キャンセルされました");
  }
});
