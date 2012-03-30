
var agent = window.navigator.userAgent;
var ua = {};
ua.webkit = /webkit/i.test(agent);
ua.chrome = /chrome/i.test(agent);
ua.safari = !ua.chrome && /safari/i.test(agent);
ua.moz = /firefox/i.test(agent);
ua.ie = /MSIE/i.test(agent);
ua.ios = /ipad|iphone|ipad/i.test(agent);
ua.iphone = /iphone|ipad/i.test(agent);
ua.ipad = /ipad/i.test(agent);
ua.android = /android/i.test(agent);
ua.winmo = /iemobile/i.test(agent);

  
  function log(){
    var div = document.createElement('div');
    div.innerHTML = [].slice.apply(arguments).join(' ');
    var log = $('#log')[0];
    if(!log) return;
    if(log.firstChild)
      log.insertBefore(div, log.firstChild);
    else
      log.appendChild(div);
  }
function log(){}
var Spkr = function(e, src, duration){
  if (!e instanceof MouseEvent) {
    throw('No mouse event given');
  }
  this.file = null;
  
  _.bindAll(this, 'step', 'onCanPlayThrough', 'onPlay', 'onPause', 'onCanPlay');
  
    
  this.latencyStats = new Stats();
  this.firstLatency = new Stats();
  this.lastLatency = [];
  
  if (ua.chrome) {
    this.firstLatency.push(50);
    this.latencyStats.push(50);
  }
  else if (ua.safari) {
    this.firstLatency.push(150);
    this.latencyStats.push(150);
  }
  else if (ua.iphone) {
    this.firstLatency.push(300);
    this.latencyStats.push(180);
  }
  else if (ua.ipad) {
    this.firstLatency.push(180);
    this.latencyStats.push(130);
  }
  else if (ua.android) {
    this.firstLatency.push(200);
    this.latencyStats.push(200);
  }
  else if (ua.winmo) {
    this.firstLatency.push(750);
    this.latencyStats.push(0);
  }
  if(ua.winmo){
    log('winmo');
  }
  setInterval(this.step, 300);
  
  this.audio = document.createElement('audio');
  this.autoCorrect = false;
  var self = this;
  //this.audio.addEventListener('loadstart', function(){ log('EVT', 'loadstart'); }, true);
  //this.audio.addEventListener('progress', function(){ log('EVT', 'progress'); }, true);
  //this.audio.addEventListener('suspend', function(){ log('EVT', 'suspend'); }, true);
  //this.audio.addEventListener('abort', function(){ log('EVT', 'abort'); }, true);
  //this.audio.addEventListener('error', function(){ log('EVT', 'error'); }, true);
  //this.audio.addEventListener('emptied', function(){ log('EVT', 'emptied'); }, true);
  //this.audio.addEventListener('stalled', function(){ log('EVT', 'stalled'); }, true);
  //this.audio.addEventListener('loadedmetadata', function(){ log('EVT', 'loadedmetadata'); }, true);
  //this.audio.addEventListener('loadeddata', function(){ log('EVT', 'loadeddata'); }, true);
  //this.audio.addEventListener('canplay', function(){ log('EVT', 'canplay'); }, true);
  //this.audio.addEventListener('canplaythrough', function(){ log('EVT', 'canplaythrough'); }, true);
  //this.audio.addEventListener('playing', function(){ log('EVT', 'playing'); }, true);
  //this.audio.addEventListener('seeking', function(){ self.isseeking = true; }, true);
  //this.audio.addEventListener('seeked', function(){ self.isseeking = false; }, true);
  //this.audio.addEventListener('ended', function(){ log('EVT', 'ended'); }, true);
  //this.audio.addEventListener('waiting', function(){ log('EVT', 'waiting'); }, true);
  //this.audio.addEventListener('durationchange', function(){ log('EVT', 'durationchange'); }, true);
  /*this.audio.addEventListener('timeupdate', function(e){
    /*if(self.audio.currentTime)
      self.timeUpdates++;
    log('EVT', 'timeupdate', self.audio.currentTime);*/
    //self.lastUpdate = e.timeStamp;
 // }, true);
  //this.audio.addEventListener('play', function(){ log('EVT', 'play'); }, true);
  //this.audio.addEventListener('pause', function(){ log('EVT', 'pause'); }, true);
  //this.audio.addEventListener('ratechange', function(){ log('EVT', 'ratechange'); }, true);
  //this.audio.addEventListener('volumechange', function(){ log('EVT', 'volumechange'); }, true);
  
  //this.audio.addEventListener('ended', this.onEnded, true);
  //this.playAtThrottled = _.throttle(this.playAt, 800);
  /*
  this.playAt = function(position, correction, expectedLatency){
    this.callTime = +new Date();
    this.playAtThrottled(position, correction, expectedLatency);
  };*/
  
  if(ua.ios){
  //this.audio.addEventListener('play', this.onPlay, true);
  //this.audio.addEventListener('pause', this.onPause, true);
  }
  this.audio.addEventListener('canplay', this.onCanPlay, true);
  this.audio.addEventListener('canplaythrough', this.onCanPlayThrough, true);
  this.audio.addEventListener('load', this.onCanPlayThrough, true);
  log('listen');
  //var self = this;
  //this.audio.addEventListener('timeupdate', function(){
  //  self.timeupdate = +new Date();
  //}, true);
  
  this.loadFile(src);
  
};
_.extend(Spkr.prototype, Backbone.Events);
_.extend(Spkr.prototype, {
  STATE_LOADING_START: 1,
  onPlay: function(){
    log('onplay');
    this.audioPlaying = true;
  },
  onPause: function(){
    log('onpause');
    this.audioPlaying = false;
  },
  loadFile: function(src, duration){
    if(src==this.src){
      return;
    }
    
    log('loadFile', src);
    /*
    // network state
    const unsigned short NETWORK_EMPTY = 0;
    const unsigned short NETWORK_IDLE = 1;
    const unsigned short NETWORK_LOADING = 2;
    const unsigned short NETWORK_NO_SOURCE = 3;
    */
    this.networkState = null;
    /*
    // ready state
    const unsigned short HAVE_NOTHING = 0;
    const unsigned short HAVE_METADATA = 1;
    const unsigned short HAVE_CURRENT_DATA = 2;
    const unsigned short HAVE_FUTURE_DATA = 3;
    const unsigned short HAVE_ENOUGH_DATA = 4;
    */
    this.readyState = null;
    this.buffers = 0;
    this.bufferedFrom = null;
    this.bufferedUntil = null;
    this.duration = null;

    var self = this;
    this.playing = false;
    this.audio.loop = true;
    this.audio.preload = true;
    this.audio.autoplay = false;
    var src2;
    if(/\?/.test(src)){
      src2=src+'&'+Math.random();
    }
    else {
      src2=src+'?'+Math.random();
    }
    this.src = src;
    log('loadpause');
    try {
    this.audio.currentTime = 0;
  }catch(e){}
    this.audio.pause();
    
      try {
      this.audio.currentTime = 0;
    }catch(e){}
    this.audio.setAttribute('src', src2);
    this.audio.play();
    if(this.audio.readyState !== 4){ //HAVE_ENOUGH_DATA
      
      setTimeout(function(){
        log('loaddeferpause');
        self.audio.pause(); //block play so it buffers before playing
      }, 1); //it needs to be after a delay, otherwise it will block download and/or won't pause.
    }
    this.ready = false;
    this.loading = true;
    this.dur = duration;
    this.playCount = 0;
    var parts = src.split('/');
    //$("#url").text(parts[parts.length - 1]);
    //$("#loaded").text(0);
  },
  onEnded: function(){
    log('EVT', 'ended', 'pause');
    
    this.pause();
  },
  onCanPlayThrough: function(){
    if (this.loading && !this.ready) {
      this.loading = false;
      //this.audio.pause();
      
      var self = this;
      setTimeout(function(){
          self.trigger('loaded');
          self.ready = true;
      }, 2000);
    }
  },
  onCanPlay: function(){
    if (this.loading && (ua.winmo || ua.android) && !this.ready) {
      this.loading = false;
      //this.audio.pause();
      var self = this;
      setTimeout(function(){
        self.trigger('loaded');
        self.ready = true;
      }, 1200);
    }  
  },
  setAutoCorrect: function(bool){
    this.autoCorrect = !!bool;
  },
  play: function() {
    this.playAt(parseFloat(this.audio.currentTime.toFixed(2)), false, 300);
  },
  playAt: function(position, correction, expectedLatency){
    var now = +new Date();
    /*console.log('spkr playat '+ position);
    if((now-this.callTime)/1000){
      position+=(now-this.callTime)/1000;
    }*/
    
    var self = this;
    /*
    if(this.audio.paused && position!=this.audio.currentTime){
      this.audio.play();
      return setTimeout(function(){
        self.playAt(position+1, correction, expectedLatency);
      }, 1000);
    }*/
    
    position = parseFloat(position.toFixed(2));
    if(this.numCorrections > 40) {
      log('correctionlimit');
      return this.pause();
    }
    this.lastCurrentTime = -1;
    this.playCount++;
    this.playTime = +ms.timesync.getTime();
    if(position<0) position=0;
    this.playPosition = position;
    if(!correction) {
      this.trackTime = this.playTime;
      this.trackPosition = this.playPosition;
      this.expectedLatency = parseInt(expectedLatency);
      this.numCorrections=0;
    }
    //if(!ua.winmo){
      
    //  this.audio.pause();
    //}
    log('playat', position, this.audio.paused?'Y':'N');
    
    this.seeking = true;
    this.timeUpdates = 0;
    var setTime = this.setCurrentTime(position);
    
    if(!setTime || (this.audio.currentTime==0 && position > 0)){
      console.log('shoulpause');
      self.audio.pause();
      var cacheCount = this.playCount;
      setTimeout(function(){
        if(self.playCount == cacheCount){
          self.playAt(parseFloat((position+(ms.timesync.getTime()-self.playTime)/1000).toFixed(2)), correction, expectedLatency);
        }
      },6000);
    }
    else {
      self.audio.play();
    }
    self.seeking = false;
    self.playing = true;
    self.fixedLatency = null;
    self.lastLatency = [];
    console.log(['setTime',position, setTime?'Y':'N', this.audio.currentTime, this.lastUpdate - new Date()].join(' '));
    //$("#playtime").text(self.playTime);
    /*
    setTimeout(function(){
      var now = +ms.timesync.getTime();
      self.playAt(((now-self.playTime)/1000).toFixed(2));
    },2000);
    */
    
    
    
  },
  nextExpectedLatency: function(){
    if(this.playCount){
      return this.latencyStats.amean();
    }
    return this.firstLatency.amean();
  },
  pause: function() {
    this.playing = false;
    log('real pause');
    this.audio.pause();
  },

  setCurrentTime: function(value) {
    try {
      // DOM Exceptions are fired when Audio Element isn't ready yet.
      this.audio.currentTime = value;
      return true;
    } catch(e) {
      return false;
    }
  },
  getLatency: function() {
    return this.lastLatency.amean();
  },
  
  correctLatency: function(delta) {
    log('correctlatency');
    var deviceLatency = this.latencyStats.amean() || 0;
    var currentTime = this.audio.currentTime;
    if(!ua.winmo) {
      log('correctpause')
      this.audio.pause();
    }
    var newPos = parseFloat(((currentTime*1000 - delta + deviceLatency)/1000).toFixed(2));
    this.playAt(newPos, true);
  },
  
  step: function() {
    /*if (!this.playing && !this.audio.paused) {
      this.audio.pause();
    }*/
    if (this.loading) {
      var readyState = this.audio.readyState;
      if (readyState !== this.readyState) {
        this.readyState = readyState;
        //$("#loadstate").text(this.readyState);
      }
      var networkState = this.audio.networkState;
      if (networkState !== this.networkState) {
        this.networkState = networkState;
        //$("#netstate").text(this.networkState);
      }
      
      var duration = this.audio.duration;
      if (duration !== this.duration) {
        this.duration = duration;
        //$("#duration").text(this.duration);
      }
      
      var buffered = this.audio.buffered;
      if(buffered.length){
        
        if(buffered.length !== this.buffers) {
          this.buffers = buffered.length;
          //$("#buffers").text(this.buffers);
        }
        
        var bufferedFrom = buffered.start(0);
        if (bufferedFrom != this.bufferedFrom) {
          this.bufferedFrom = this.bufferedFrom;
          //$("#bufferstart").text(bufferedFrom);
        }
        var bufferedTo = buffered.end(0);
        if (bufferedTo != this.bufferedTo) {
          this.bufferedTo = this.bufferedTo;
          //$("#bufferend").text(bufferedTo);
        }
        
        if(bufferedTo > this.dur || bufferedTo > 40) {
          this.onCanPlayThrough();
          this.loading = false;
        }
        
      }
      
      
    }
    
    var currentTime = this.audio.currentTime;
    /*
    if((!currentTime || this.audio.paused) && this.playing && !ua.winmo ){
      this.audio.pause();
      this.audio.play();
      log('ret2', currentTime);
      //return;
    }
    if(ua.winmo && !currentTime && this.playing){
      this.audio.play();
      log('ret1');
      return;
    }
    if(this.audioPlaying && !this.playing){
      this.audio.pause();
    }
    /*
    if(this.lastCurrentTime == currentTime && this.playing){
      log('force play', this.autoCorrect?'Y':'N');
      this.audio.play();
    }*/
    //$('#loaded').text(this.playing?'Y':'N');
    if (this.playing && this.timeUpdates) {
      var now = ms.timesync.getTime();
      var latency = Math.round((now - this.playTime) - (currentTime - this.playPosition) * 1000);
      /*
      Latency is known if:
        - 3 last measurements were pretty equal.
        - Average of 15 first measurements on Android 2.3
      */
      
      if (latency !== this.latency) {
        this.latency = latency;
        //$("#latency").text(latency.toFixed(5));
      }
      var tlatency = Math.round((now - this.trackTime) - (currentTime - this.trackPosition) * 1000);
      if (tlatency !== this.tlatency) {
        this.tlatency = tlatency;
        //$("#tracklatency").text(tlatency.toFixed(5));
      }
      var fixedLatency = this.fixedLatency;
      if (this.fixedLatency === null && currentTime > this.playPosition + (this.playCount==1?.2:0) ) {
        
        this.lastLatency.push(latency);
        var len = this.lastLatency.length;
        if (len >2 && Math.abs(latency - this.lastLatency[len - 2]) <= 2 && Math.abs(latency - this.lastLatency[len - 3]) <= 2){
          this.fixedLatency = (this.lastLatency[len - 2] + this.lastLatency[len - 3] + latency) / 3;
          this.fixedLatencySet = 1;
        }
        else if (len>15 && ua.android) {
          var sum = 0;
          for (var i=0; i < this.lastLatency.length; i++) {
            sum += this.lastLatency[i];
          }
          this.fixedLatency = sum/this.lastLatency.length;
          this.fixedLatencySet = 1;
          
        }
      }
      if (this.fixedLatencySet && !this.seeking && !this.isseeking) {
        if (this.playCount == 1) {
          this.firstLatency.push(this.fixedLatency);
        }
        else {
          this.latencyStats.push(this.fixedLatency);
        }
        this.fixedLatencySet = 0;
        //$("#latency2").text(this.fixedLatency);
        if (this.autoCorrect) {
          var diff = this.tlatency - this.expectedLatency;
          if (Math.abs(diff) > 50) {
            this.correctLatency(-diff);
          }
        }
      }
    }
    $('#time').text(currentTime.toFixed(1) );
    this.lastCurrentTime = currentTime;
  }
});
