    new MooWheel.Remote(araaywheelData, $('canvas'), {  onItemClick: function(item, e) {
                    var url = "http://twitter.com/"+item.id;
                    window.open(url);
                 },
                 type: 'heat'
             });
