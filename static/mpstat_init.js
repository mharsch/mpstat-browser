var mpstat_init = function() {

	// internal state variables and functions go here

	var fields = {
		CPU: { sys: { value: function (s) { return (s.instance); } } },
		minf: { vm: { value: ['as_fault', 'hat_fault'] } },
		mjf: { vm: { value: 'maj_fault' } },
		xcal: { sys: { value: 'xcalls' } },
		intr: { sys: { value: 'intr', width: 5 } },
		ithr: { sys: { value: 'intrthread' } },
		csw: { sys: { value: 'pswitch', width: 4 } },
		icsw: { sys: { value: 'inv_swtch' } },
		migr: { sys: { value: 'cpumigrate' } },
		smtx: { sys: { value: 'mutex_adenters' } },
		srw: { sys: { value: ['rw_rdfails', 'rw_wrfails'], width: 4 } },
		syscl: { sys: { value: 'syscall' } },
		usr: { sys: { value: 'cpu_nsec_user', time: true } },
		sys: { sys: { value: 'cpu_nsec_kernel', time: true } },
		wt: { sys: { value: function () { return (0); }, width: 3 } },
		idl: { sys: { value: 'cpu_nsec_idle', time: true } }
	};

	// instead of reading kstats directly, reader is set externally with
	// JSON-parsed data retrieved over HTTP by the ajax page from the
	// REST API serving kstats on the server

	var reader = {};

	var txt_output = '';
	var obj_output = [];

	var pad = function (str, len) {
		var rval = '', i;

		for (i = 0; i < len - str.length; i++)
			rval += ' ';

		rval += str;

		return (rval);
	};

	var genheader = function ()
	{
		var f, s;
		var str = '';

		for (f in fields) {
			for (s in fields[f]) {
				if ((w = fields[f][s].width) !== 0)
					break;
			}

			if (str.length > 0)
				str += ' ';

			str += pad(f, w ? w : f.length);
		}

		return (str + '\n');
	};

	var gencpu = function (now, last, cpu)
	{
		var f, s;
		var line = '', i;

		for (f in fields) {
			for (s in fields[f])
				stat = fields[f][s];

			if (stat.value instanceof Function) {
				value = stat.value(now[s], last[s]);
			} else if (stat.value instanceof Array) {
				value = 0;

				for (i = 0; i < stat.value.length; i++) {
					value += (now[s].data[stat.value[i]] -
					    last[s].data[stat.value[i]]);
				}
			} else {
				value = now[s].data[stat.value] -
				    last[s].data[stat.value];
			}

			if (stat.time) {
			/*
			 * If this is an expression of percentage of time, we
			 * need to divide by the delta in snap time.
			 */
				value = parseInt((value / (now[s].snaptime -
				    last[s].snaptime) * 100.0) + '', 10);
			}

			if (line.length > 0)
				line += ' ';

			line += pad(value + '', stat.width ? stat.width :
			    f.length);

			if (!obj_output[cpu])
				obj_output.push({});
				
			obj_output[cpu][f] = value;
		}

		txt_output += line + '\n';
	};

	var data = [];
	var gen = 0;

	var refresh = function ()
	{
		if (txt_output) {
			txt_output = '';
		}

		if (obj_output) {
			obj_output = [];
		}

		var now = {};
		var cpus = [];
		var header = false, i;

		gen = gen ^ 1;
		data[gen] = {};

		for (stat in reader) {
			now = reader[stat];

			for (i = 0; i < now.length; i++) {
				var id = now[i].instance;

				if (!data[gen][id]) {
					cpus.push(id);
					data[gen][id] = {};
				}

				data[gen][id][stat] = now[i];
			}
		}

		cpus.sort(function(a,b) { return a - b; });

		for (i = 0; i < cpus.length; i++) {
			if (data[gen ^ 1] && data[gen ^ 1][cpus[i]]) {
				if (!header) {
					txt_output += genheader();
					header = true;
				}

				gencpu(data[gen][cpus[i]],
				    data[gen ^ 1][cpus[i]], i);
			}
		}
	};

	return {
		update_kstats: function(kstats) {
			reader = kstats;
			refresh();
		},

		get_txt_output: function() {
			return (txt_output);
		},

		get_obj_output: function() {
			return (obj_output);
		}
	};
};
