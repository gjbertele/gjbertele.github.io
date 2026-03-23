
var elem = document.querySelector('textarea')
var content = 'URL ​​​​​Finde'
elem.value = content + 'r'
elem.focus()
var test = document.getElementById("Test");
test.style.fontSize = '10em';
var ac = document.querySelector(".aContent");
ac.style.fontSize = '5em';
var a = document.querySelector('.a')
document.querySelector('textarea').onkeydown = function (e) {
    if (elem.value.startsWith(content)) {
        elem.value = elem.value.substr(15)
    }
    var lcScaled = false
    while (test.clientWidth > document.body.clientWidth - 51) {
        tFontSize = tFontSize - (1 / 13)
        elem.style.fontSize = tFontSize + 'em'
        test.style.fontSize = tFontSize + 'em'
        lcScaled = true
    }
    if (lcScaled == false) {
        while (test.clientWidth < document.body.clientWidth - 51 && tFontSize < 10) {
            tFontSize = tFontSize + (1 / 13)
            elem.style.fontSize = tFontSize + 'em'
            test.style.fontSize = tFontSize + 'em'
        }
    }

    var aScaled = false
    while (ac.clientWidth > document.body.clientWidth * (2 / 3)) {
        aFontSize = aFontSize - (1 / 13)
        a.style.fontSize = aFontSize + 'em'
        ac.style.fontSize = aFontSize + 'em'
        aScaled = true
    }
    if (aScaled == false) {
        while (ac.clientWidth < document.body.clientWidth * (2 / 3) && aFontSize < 5) {
            aFontSize = aFontSize + (1 / 13)
            a.style.fontSize = aFontSize + 'em'
            ac.style.fontSize = aFontSize + 'em'
        }
    }

}
var tFontSize = 10
var aFontSize = 5
setInterval(function () {
    var plcpem = getComputedStyle(document.querySelector('.emPlaceholder')).width
    pem = Number(plcpem.substr(0, plcpem.length - 2))
    var word = document.querySelector('textarea').value.replaceAll(' ', '')
    var newline = '\n'
    var str = ''
    tlds.forEach(function (i) {
        if (word.toLowerCase().endsWith(i.toLowerCase()) || word.toLowerCase().includes(i.toLowerCase())) {
            if (word.toLowerCase().indexOf(i.toLowerCase()) != 0 && !word.toLowerCase().endsWith(i.toLowerCase())) {
                str += word.toLowerCase().split(i.toLowerCase())[0] + '.' + i.toLowerCase() + '/' + word.toLowerCase().split(i.toLowerCase()).splice(1).join(i.toLowerCase()) + newline
            }
            if (word.toLowerCase().endsWith(i.toLowerCase()) && word.length > i.length) {
                str += word.toLowerCase().substr(0, word.toLowerCase().length - i.toLowerCase().length) + '.' + i.toLowerCase() + '/' + newline
            }
        }
    })
    document.querySelector('.a').textContent = str
    document.querySelector('.a').style.display = 'inline-block'
    test.textContent = word + 'a'
    ac.textContent = str.split(newline)[0] + 'a'
}, 10)
