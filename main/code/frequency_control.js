/* 
	Author: Ryan Lee
	Date: September 19, 2016

	Receives or generate frequency and sends it to the partials
*/

outlets = 3;

var settings = new Global( "settings" );
var util = new Global( "utilities" ).util;
var presets = new Global( "presets" );

/* 
	Here we set the frequency of the cycles and change the enveloping.
*/
function msg_float( frequency )
{
	settings.fundamental = frequency;
	var partials = util.FindAllObjectsByScriptingName( "partial_" );

	var totalFreq = 0;

	for ( i = 0; i < partials.length; i++ ) 
	{
		post();
		//partial multplier
		var multiplier = ( 	Math.random() * ( settings.partialMultiplier - -settings.partialMultiplier ) + 
							-settings.partialMultiplier ) + 1;
		//disconnect before connecting
		this.patcher.disconnect( this.box, 1, partials[i], 1);
		this.patcher.disconnect( this.box, 0, partials[i], 0);

		this.patcher.hiddenconnect( this.box, 1, partials[i], 1);

		//ADSR envelope preset
		var numOfPts = parseInt( presets.kv.get( "presets::points::adadadadr_1000" + "::numOfPts" ) );

		//Clear the existing envelope
		this.outlet( 1, new Array( "clear" ) );

		//Setting the envelope for the function
		for ( q = 0; q < numOfPts; q++ ) 
		{
			this.outlet( 1, util.getPresetPoint( "presets::points::adadadadr_1000", q, i ) );
			//making sure the domain of the envelope is consistent with the length of the note
			this.outlet( 1, new Array( "domain", 1000 * settings.sustain ) );
		}

		//set fundamnetal
		var freq = settings.fundamental;
		if ( settings.sequence.localeCompare( "arithmetic" ) == 0 )
		{	if ( i != 0 ) 
			{
				if ( settings.overtone == 1 ) 
				{
					freq = settings.fundamental + settings.fundamental * i * settings.arithmetic;
				}
				else if ( settings.overtone == 0 ) 
				{
					
					freq = ( settings.fundamental + settings.fundamental * i * settings.arithmetic ) * multiplier;
				}
			}
			else
			{
				freq = settings.fundamental;
			}
		}
		else if ( settings.sequence.localeCompare( "geometric" ) == 0 )
		{
			if ( i != 0 ) {
				if ( settings.overtone == 1 ) 
				{
					freq = settings.fundamental * Math.pow( 2, (i + 1) * settings.geometric );
				}
				else if ( settings.overtone == 0 ) 
				{
					freq = settings.fundamental * Math.pow( 2, (i + 1) * settings.geometric ) * multiplier;
				}
			}
			else
			{
				freq = settings.fundamental;
			}
			
		}

		totalFreq = totalFreq + freq;
		this.patcher.hiddenconnect( this.box, 0, partials[i], 0);
		this.outlet( 0, freq );
		this.patcher.disconnect( this.box, 0, partials[i], 0);



		//Bang to play the sound
		this.outlet( 1, new Array( "bang" ) );

		this.patcher.disconnect( this.box, 1, partials[i], 1);
	}

	this.patcher.hiddenconnect( this.box, 2,  this.patcher.getnamed( "live.gain~" ), 0);
	if ( totalFreq > 4000 && totalFreq < 15000 ) 
	{
		this.outlet( 2, -totalFreq / 2000.0 );
	}
	else if ( totalFreq > 15000 && totalFreq < 20000 )
	{
		this.outlet( 2, -totalFreq / 3000.0 );
	}
	else if ( totalFreq > 20000 && totalFreq < 50000 )
	{
		this.outlet( 2, 0.0 );
	}
	else if ( totalFreq > 50000 )
	{
		this.outlet( 2, -3.0 );
	}
	else
	{
		this.outlet( 2, 5.0 );
	}
	this.patcher.disconnect( this.box, 2, this.patcher.getnamed( "live.gain~" ), 0);

}