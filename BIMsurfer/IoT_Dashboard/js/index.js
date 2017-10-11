	$(document).ready(function() {
		// Change the frequency of the POST request
		var $delay = 1000,
			vMin = 26.5,
			vMax = 28.5,
			cMin = .3,
			cMax = 2.5,
			mMin = 0,
			mMax = 5,
			totalPoints = 25,
			$voltageDisplay = $('div.volts'),
			$currentDisplay = $('div.amps'),
			$moistureDisplay = $('div.moisture');

		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function updateVoltage(value) {
			$voltageDisplay.html(value);
		}

		function updateCurrent(value) {
			$currentDisplay.html(value);
		}

		function updateMoisture(value) {
			$moistureDisplay.html(value + '<span>%</span>');
		}

		function updateSensorDisplayValues(d) {
			updateVoltage(d[0]);
			updateCurrent(d[1]);
			updateMoisture(d[2]);
		}

		Highcharts.setOptions({
			global: {
				useUTC: false
			},
			plotOptions: {
				series: {
					marker: {
						enabled: true
					}
				}
			},
			tooltip: {
				enabled: true
			}
		});

		$('#sensorData').highcharts({
			chart: {
				type: 'spline',
				events: {
					load: function() {
						var voltage = this.series[0];
						var current = this.series[1];
						var moisture = this.series[2];
						var x, volts, amps, mPercent;

						// faking sensor data
						// data will be coming from sensors on the MKR1000
						setInterval(function() {
							x = (new Date()).getTime(),
								volts = getRandomInt(vMin, vMax),
								amps = getRandomInt(cMin, cMax),
								mPercent = getRandomInt(mMin, mMax);

							voltage.addPoint([x, volts], true, true);
							current.addPoint([x, amps], true, true);
							moisture.addPoint([x, mPercent], true, true);

							updateSensorDisplayValues([volts, amps, mPercent]);
						}, $delay);
					}
				}
			},
			title: {
				text: 'VisuaLynk IoT Data',
				style: {
					color: '#ffffff',
					font: '18px Raleway'
				}
			},
			xAxis: {
				type: 'datetime',
				tickPixelInterval: 500
			},
			yAxis: [{
				title: {
					text: 'TEMPRATURE',
					style: {
						color: '#2b908f',
						font: '13px Raleway'
					}
				},
				min: 0,
				max: 25,
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			}, {
				title: {
					text: 'CURRENT',
					style: {
						color: '#90ee7e',
						font: '13px Raleway'
					}
				},
				min: 0,
				max: 20,
				opposite: false,
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			}, {
				title: {
					text: 'MOISTURE',
					style: {
						color: '#f45b5b',
						font: '13px Raleway'
					}
				},
				min: 0,
				max: 100,
				opposite: false,
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			}],
			tooltip: {
				formatter: function() {
					var unitOfMeasurement = this.series.name === 'VOLTAGE' ? ' V' : ' A';
					return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.numberFormat(this.y, 1) + unitOfMeasurement;
				}
			},
			legend: {
				enabled: true
			},
			exporting: {
				enabled: true
			},
			series: [{
				name: 'TEMPRATURE',
				yAxis: 0,
				style: {
					color: '#2b908f',
					font: '13px Raleway'
				},
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -totalPoints; i <= 0; i += 1) {
						data.push({
							x: time + i * $delay,
							y: getRandomInt(25, 25)
						});
					}
					return data;
				}())
			}, {
				name: 'CURRENT',
				yAxis: 1,
				style: {
					color: '#2b908f',
					font: '13px Raleway'
				},
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -totalPoints; i <= 0; i += 1) {
						data.push({
							x: time + i * $delay,
							y: getRandomInt(.7, .7)
						});
					}
					return data;
				}())
			}, {
				name: 'HUMIDITY',
				yAxis: 2,
				style: {
					color: '#2b908f',
					font: '13px Raleway'
				},
				data: (function() {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -totalPoints; i <= 0; i += 1) {
						data.push({
							x: time + i * $delay,
							y: getRandomInt(1, 1)
						});
					}
					return data;
				}())
			}]
		});
	});
