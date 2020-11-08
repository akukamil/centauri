var app, game_tick, game,start_screen, upgrade_screen, final_screen, instruction_screen, environment, rocket, control_panel, game_res, global_state, l_down=false, r_down=false, u_down=false, d_down=false, process_func=function(){};

global_state = "start_screen";

class rocket_class
{
	
	constructor()
	{
		this.upgrade_program=JSON.parse(game_res.resources["rockets_params"].data);
		this.fuel=0;
		this.fuel_cons_rate=0.025;		
		this.shield_power=0;	
		this.force=0;
		this.max_force=10;
		this.boost_force=0;
		this.dirx=0;
		this.diry=-1;
		this.gravity_force=5;


		this.maneur_speed=0;
		
		this.state="fly";
		this.process_func=this.process_fly;
		this.tick=0;
		
		this.rocket = new PIXI.extras.AnimatedSprite([game_res.resources["rocket_0_0"].texture, game_res.resources["rocket_0_1"].texture]);
		this.rocket.x=400;
		this.rocket.y=450;
		this.rocket.anchor.set(0.5,0.5);
		this.rocket.gotoAndPlay(0);
		this.rocket.animationSpeed = 0.4;
		app.stage.addChild(this.rocket);
		

		
		//explosion textures array
		this.explosion_textures=[];
		for (var r=0;r<41;r++)
			this.explosion_textures.push(game_res.resources["rocket_expl_"+r].texture);	
		
		this.rocket_expl=new PIXI.extras.AnimatedSprite(this.explosion_textures);
		this.rocket_expl.visible=false;
		this.rocket_expl.x=400;
		this.rocket_expl.y=450;
		this.rocket_expl.anchor.set(0.5,0.5);
		this.rocket_expl.scale.x=0.7;
		this.rocket_expl.scale.y=0.7;
		this.rocket_expl.animationSpeed=2;
		app.stage.addChild(this.rocket_expl);	
		
		this.orb = new PIXI.Sprite(game_res.resources["orb"].texture);
		this.orb.x=400;
		this.orb.y=450;
		this.orb.anchor.set(0.5,0.5);
		app.stage.addChild(this.orb);
		
	}
	
	db_down_event()
	{
		if (this.state==="hit")
			return;
		this.rocket.stop();
		this.rocket.texture=game_res.resources["rocket_"+upgrade_screen.rocket_id+"_s"].texture;
	}
	
	db_released_event()
	{
		if (this.state==="hit")
			return;
		this.rocket.gotoAndPlay(0);	
	}
	
	set_state(state)
	{
        this.state = state;
		this.tick=game_tick;

        switch (this.state)
		{
            case "fly":
				this.process_func=this.process_fly;
				this.rocket.visible=true;
				this.orb.visible=false;
				this.rocket.gotoAndPlay(0);	
			break;
			
			case "protected":
				this.process_func=this.process_protected;
				this.orb.visible=true;	
				if (this.state!= "protected")
					this.orb.alpha=0;
				this.rocket.visible=true;
				this.rocket.gotoAndPlay(0);	
				this.shield_power+=15;
				this.shield_power=Math.min(this.shield_power,control_panel.max_shield_power);
			break;
			
            case "hit":
				this.process_func=this.process_hit;
				this.rocket.visible=false;
				this.force/=2;
				this.boost_force=0;
				this.rocket.stop();
				this.rocket.texture=game_res.resources["rocket_"+upgrade_screen.rocket_id+"_s"].texture;
			break;		
        }
	}
		
	add_fuel(val)
	{		
		this.fuel+=val;
		this.fuel=Math.min(this.fuel,control_panel.max_fuel);		
	}	
		
	add_boost()
	{
		this.boost_force+=10;
		if (this.boost_force>11)
			this.set_state("protected");		
		
	}
	
	process_fly()
	{
		
		if (l_down)
			this.rocket.rotation-=this.maneur_speed;
		if (r_down)
			this.rocket.rotation+=this.maneur_speed;	
		
		this.rocket.rotation=Math.min(Math.PI/2,this.rocket.rotation);
		this.rocket.rotation=Math.max(-Math.PI/2,this.rocket.rotation);
			
		this.dirx=Math.sin(this.rocket.rotation);
		this.diry=-Math.cos(this.rocket.rotation);	
		
		if (this.force<(this.max_force+this.boost_force) && d_down===false)
		{
			if (this.force>30)
				this.force+=0.025;	
			else
				this.force+=0.1;	
		}
		
		if (this.force>(this.max_force+this.boost_force) || d_down===true)
			this.force-=0.1;
		
		if (this.boost_force>0 && d_down===false)
			this.boost_force-=0.1;		
		
		
		if (this.fuel>=0)
		{
			if (d_down===false)
				this.fuel-=this.fuel_cons_rate;				
		}	
		else
			set_global_state("low_fuel");			

	}
	
	process_protected()
	{		
		this.orb.rotation+=0.1;
		if (this.orb.alpha<1)
		{
			this.orb.alpha+=0.02;			
			this.orb.alpha=Math.min(this.orb.alpha,1);
		}
		
		this.shield_power-=0.0275;
		if (this.shield_power<=0)
		{
			this.shield_power=0;
			this.set_state("fly");					
		}
		
		if (l_down)
			this.rocket.rotation-=this.maneur_speed;
		if (r_down)
			this.rocket.rotation+=this.maneur_speed;	
		
		this.rocket.rotation=Math.min(Math.PI/2,this.rocket.rotation);
		this.rocket.rotation=Math.max(-Math.PI/2,this.rocket.rotation);
			
		this.dirx=Math.sin(this.rocket.rotation);
		this.diry=-Math.cos(this.rocket.rotation);	
		
		if (this.force<(this.max_force+this.boost_force) && d_down===false)
		{
			if (this.force>30)
				this.force+=0.025;	
			else
				this.force+=0.1;	
		}

		
		if (this.force>(this.max_force+this.boost_force) || d_down===true)
			this.force-=0.1;
		
		
		if (this.boost_force>0)
			this.boost_force-=0.1;		
		
		
		if (this.fuel>=0)
		{
			if (d_down===false)
				this.fuel-=this.fuel_cons_rate;				
		}	
		else
			set_global_state("low_fuel");			

	}
	
	process_hit()
	{		
	
		this.rocket.visible=Math.floor(game_tick*10)%2===0;
		
		if (game_tick>this.tick+3)
			set_global_state("destoyed");

		this.force-=0.1;	
		this.force=Math.max(0,this.force);
	}
	
	draw_and_init()
	{
		this.set_state("fly");
		this.start_fuel=this.upgrade_program[upgrade_screen.rocket_id][0];
		this.maneur_speed=this.upgrade_program[upgrade_screen.rocket_id][2];
		this.max_force=this.upgrade_program[upgrade_screen.rocket_id][3];
		this.fuel=this.start_fuel;	
		this.force=0;
		this.boost_force=0;
		this.shield_power=0;
		this.rocket.rotation=0;		
	}
	
}

class low_fuel_screen_class
{
	
	constructor()
	{
		this.tick=0;
		
		this.bcg=new PIXI.Sprite(game_res.resources["upg_scr_bcg"].texture);
		app.stage.addChild(this.bcg);	
		
		this.out_of_fuel_text = new PIXI.Sprite(game_res.resources["out_of_fuel_text"].texture);
		this.out_of_fuel_text.x=400;
		this.out_of_fuel_text.y=300;
		this.out_of_fuel_text.anchor.set(0.5,0.5);
		app.stage.addChild(this.out_of_fuel_text);
	}
	
	draw_and_init()
	{
		this.tick=0;
		this.bcg.visible=true;
		process_func=function(){this.process()}.bind(this);	
		this.out_of_fuel_text.visible=true;
	}
	
	process()
	{
		this.tick += 0.01666666;
		if (this.tick>3)
			set_global_state("upgrade");
	}
	
}

class destoyed_screen_class
{
	
	constructor()
	{
		this.tick=0;
		
		
		this.bcg=new PIXI.Sprite(game_res.resources["upg_scr_bcg"].texture);
		app.stage.addChild(this.bcg);	
		
		this.destroyed_text = new PIXI.Sprite(game_res.resources["destroyed_text"].texture);
		this.destroyed_text.x=400;
		this.destroyed_text.y=300;
		this.destroyed_text.anchor.set(0.5,0.5);
		app.stage.addChild(this.destroyed_text);
		
	}
	
	draw_and_init()
	{
		this.tick=0;
		this.bcg.visible=true;
		process_func=function(){this.process()}.bind(this);	
		this.destroyed_text.visible=true;
	}
	
	process()
	{
		this.tick += 0.01666666;
		if (this.tick>3)
			set_global_state("upgrade");
	}
	
}

class control_panel_class
{
	
	constructor()
	{
		

		this.max_params=[42.222,46.667,51.111,55.556,60.000,64.444,68.889,73.333,77.778,82.222,86.667,91.111,95.556,100.000];
		this.max_fuel=this.max_params[0];
		this.max_shield_power=this.max_params[0];		
		
		//control bars
		this.fuel_bar_base= new PIXI.Sprite(game_res.resources["control_bar_base_0"].texture);	
		this.fuel_bar_base.x=30;
		this.fuel_bar_base.y=570;
		app.stage.addChild(this.fuel_bar_base);		
		
		this.fuel_bar_div= new PIXI.Sprite(game_res.resources["control_bar_front"].texture);	
		this.fuel_bar_div.x=30;
		this.fuel_bar_div.y=570;
		app.stage.addChild(this.fuel_bar_div);

				
		this.shield_bar_base= new PIXI.Sprite(game_res.resources["control_bar_base_0"].texture);	
		this.shield_bar_base.x=30;
		this.shield_bar_base.y=540;
		app.stage.addChild(this.shield_bar_base);
		
		this.shield_bar_div= new PIXI.Sprite(game_res.resources["control_bar_front_2"].texture);	
		this.shield_bar_div.x=30;
		this.shield_bar_div.y=540;
		app.stage.addChild(this.shield_bar_div);
		
		//icons
		this.fuel_icon= new PIXI.Sprite(game_res.resources["fuel_icon"].texture);	
		this.fuel_icon.x=5;
		this.fuel_icon.y=570;
		app.stage.addChild(this.fuel_icon);		
		
		this.shield_icon= new PIXI.Sprite(game_res.resources["shield_icon"].texture);	
		this.shield_icon.x=5;
		this.shield_icon.y=540;
		app.stage.addChild(this.shield_icon);	
		
		
		
		this.exp_base= new PIXI.Sprite(game_res.resources["exp_base"].texture);	
		this.exp_base.x=15;
		this.exp_base.y=470;
		app.stage.addChild(this.exp_base);
						
		this.exp_balance_text = new PIXI.Text("0", { fontSize: 28, fontFamily: "Tempus Sans ITC", fill: 0xFFFFFF });
		this.exp_balance_text.x=120;
		this.exp_balance_text.y=458;
		app.stage.addChild(this.exp_balance_text);	
		
	}
	
	draw_and_init()
	{
		
		this.max_fuel=this.max_params[upgrade_screen.rocket_id];
		this.max_shield_power=this.max_params[upgrade_screen.rocket_id];	
		this.fuel_bar_base.visible=true;
		this.shield_bar_base.visible=true;
		this.fuel_bar_div.visible=true;
		this.shield_bar_div.visible=true;
		this.exp_base.visible=true;
		this.fuel_icon.visible=true;
		this.shield_icon.visible=true;

	}
	
	process()
	{
		this.fuel_bar_div.scale.x=rocket.fuel/100;			
		this.shield_bar_div.scale.x=rocket.shield_power/100;			
	}
	
}

class environment_class
{
	
	constructor()
	{
		
		//explosion textures array
		this.explosion_textures=[];
		for (var r=0;r<39;r++)
			this.explosion_textures.push(game_res.resources["explosion_"+r].texture);	
		
		//probability table for interactive objects
		this.prob_table=JSON.parse(game_res.resources["prob_table"].data);
		this.cur_prob_line=0;
		this.next_prob_line_height=this.prob_table[0][1];
		this.prv_prob_line_height=this.prob_table[0][0];
		
		this.exp_balance=0;
		this.eye_y=0;
		this.time_check_0=0;
		
		this.program = JSON.parse(game_res.resources["program"].data);
		this.back_program = JSON.parse(game_res.resources["back_program"].data);
		
		this.next_forw_obj=0;
		this.next_back_obj=-1;		
		
		this.interactive_object_interval=50;
		this.next_interactive_object_height=0;
		
		this.sky_gradient= new PIXI.Sprite(game_res.resources["sky_gradient"].texture);	
		this.sky_gradient.x=0;
		this.sky_gradient.y=-10000+600;
		this.sky_gradient.width=800;
		this.sky_gradient.height=10000;
		app.stage.addChild(this.sky_gradient);
		
		//background  objects
		this.obj=[[],[],[],[],[]];
		for (var i=0;i<this.obj.length;i++)
		{
			for (var s=0;s<50;s++)
			{			
				this.obj[i].push(new PIXI.Sprite(game_res.resources["exp_0"].texture));
				this.obj[i][s].anchor.set(0.5,0.5);		
				this.obj[i][s].visible=false;
				this.obj[i][s].active=false;
				this.obj[i][s].radius=0;		
				this.obj[i][s].spd_mult=1;
				this.obj[i][s].pos_id=0;
				this.obj[i][s].x_pos=0;
				this.obj[i][s].y_pos=0;
				this.obj[i][s].z_dist=0;
				this.obj[i][s].on_dist=0;
				this.obj[i][s].off_dist=0;
				this.obj[i][s].id=0;
				app.stage.addChild(this.obj[i][s]);
			}			
		}
		
		
		//interactive objects
		this.interactive_objects=[];
		for (var i=0;i<50;i++)
		{
			this.interactive_objects.push(new PIXI.extras.AnimatedSprite([game_res.resources["aster"].texture]));
			this.interactive_objects[i].visible=false;
			this.interactive_objects[i].dx=0;
			this.interactive_objects[i].dy=0;
			this.interactive_objects[i].anchor.set(0.5,0.5);
			this.interactive_objects[i].start_time=0;
			this.interactive_objects[i].type="empty";
			app.stage.addChild(this.interactive_objects[i]);				
		}
	
		this.shift_x=0;
		this.shift_y=1;
		
		this.progress_panel= new PIXI.Sprite(game_res.resources["progress_panel"].texture);	
		this.progress_panel.x=750;
		this.progress_panel.y=0;
		app.stage.addChild(this.progress_panel);
		
		this.navigation_arrow= new PIXI.Sprite(game_res.resources["navigation_arrow"].texture);	
		this.navigation_arrow.x=750;
		this.navigation_arrow.y=0;
		this.navigation_arrow.anchor.set(0.5,0.5);
		app.stage.addChild(this.navigation_arrow);
		
		//low fuel sign
		this.low_fuel = new PIXI.Sprite(game_res.resources["low_fuel"].texture);	
		this.low_fuel.x=400;
		this.low_fuel.y=30;
		this.low_fuel.anchor.set(0.5,0.5);
		app.stage.addChild(this.low_fuel);		
		
		
	}

	draw_and_init()
	{		
	
		this.eye_x=0;
		this.eye_y=0;
		
		this.next_forw_obj=0;
		this.next_back_obj=-1;
		
		this.progress_panel.visible=true;
		this.navigation_arrow.visible=true;
		
		this.sky_gradient.visible=true;
		
		//init background objects
		for (var i=0;i<this.obj.length;i++)
		{
			for (var s=0;s<50;s++)
			{			
				this.obj[i][s].anchor.set(0.5,0.5);		
				this.obj[i][s].visible=false;
				this.obj[i][s].active=false;
				this.obj[i][s].radius=0;		
				this.obj[i][s].spd_mult=1;
				this.obj[i][s].pos_id=0;
				this.obj[i][s].x_pos=0;
				this.obj[i][s].y_pos=0;
				this.obj[i][s].z_dist=0;
				this.obj[i][s].on_dist=0;
				this.obj[i][s].off_dist=0;
				this.obj[i][s].id=0;
			}			
		}
		
		//init first objects
		for (var i=0;i<10;i++)
		{
			var next_on_obj_dist=this.program[this.next_forw_obj][7];
			if (this.eye_y>next_on_obj_dist)
			{	
				this.add_object(this.next_forw_obj);
				this.next_forw_obj++;
			}				
		}
	
	}

	add_object(id)
	{		
		var z_index=this.program[id][2];
		
		for (var i=0;i<this.obj[z_index].length;i++)
		{
			if (this.obj[z_index][i].visible===false)
			{
				this.obj[z_index][i].texture=game_res.resources[this.program[id][1]].texture;
				this.obj[z_index][i].x_pos=this.program[id][3];	
				this.obj[z_index][i].name=this.program[id][1];
				if (this.obj[z_index][i].name==="big_ship" || this.obj[z_index][i].name==="big_planet" || this.obj[z_index][i].name==="big_black_hole" || this.obj[z_index][i].name==="iss" )
					this.obj[z_index][i].x_pos=this.eye_x;
								
				this.obj[z_index][i].visible=true;
				this.obj[z_index][i].active=true;
				this.obj[z_index][i].alpha=this.program[id][4];
				this.obj[z_index][i].scale.x=this.program[id][5];
				this.obj[z_index][i].scale.y=this.program[id][5];
				this.obj[z_index][i].z_dist=this.program[id][6];	
				this.obj[z_index][i].y_pos=this.program[id][0];		
				this.obj[z_index][i].on_dist=this.program[id][7];	
				this.obj[z_index][i].off_dist=this.program[id][8];	
				this.obj[z_index][i].id=id;
				return;
			}
		}
	}
	
	add_interactive_object(forw_move)
	{
		for (var i=0;i<this.interactive_objects.length;i++)
		{
			if (this.interactive_objects[i].visible===false)
			{
				
				var r_num=Math.random();
				this.interactive_objects[i].stop();
				this.interactive_objects[i].scale.x=1;	
				this.interactive_objects[i].alpha=1;
				
				if (r_num>=this.prob_table[this.cur_prob_line][2] && r_num<this.prob_table[this.cur_prob_line][3])
				{					
					return;					
				}
				//cloud
				if (r_num>=this.prob_table[this.cur_prob_line][3] && r_num<this.prob_table[this.cur_prob_line][4])
				{
					
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].alpha=0.8;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].texture=game_res.resources["cloud_"+Math.floor(Math.random()*7)].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="cloud";	
					}
					else
					{	
				
						if (this.eye_y<1300)
							return;
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=900;
						this.interactive_objects[i].alpha=0.8;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].texture=game_res.resources["cloud_4"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="cloud";	
					}				
			
				}
				//fuel
				if (r_num>=this.prob_table[this.cur_prob_line][4] && r_num<this.prob_table[this.cur_prob_line][5])
				{
					if (forw_move)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-60;	
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].texture=game_res.resources["fuel_can"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;
						this.interactive_objects[i].type="fuel";						
					}						
				}
				//exp
				if (r_num>=this.prob_table[this.cur_prob_line][5] && r_num<this.prob_table[this.cur_prob_line][6])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						
						this.interactive_objects[i].textures=[game_res.resources["exp_0"].texture,
						game_res.resources["exp_1"].texture,
						game_res.resources["exp_2"].texture,
						game_res.resources["exp_3"].texture,
						game_res.resources["exp_4"].texture,
						game_res.resources["exp_5"].texture,
						game_res.resources["exp_6"].texture,
						game_res.resources["exp_7"].texture];						
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.1;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="exp";	
					}
						
				}
				//plane
				if (r_num>=this.prob_table[this.cur_prob_line][6] && r_num<this.prob_table[this.cur_prob_line][7])
				{

						var r_int=Math.floor(Math.random() * 2)*2-1;
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].x=-100+(r_int+1)*500;
						this.interactive_objects[i].y=-100+Math.random()*500;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].scale.x=r_int;	
						this.interactive_objects[i].dx=-0.4*r_int;
						this.interactive_objects[i].dy=Math.random()/5;
						this.interactive_objects[i].texture=game_res.resources["plane"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;						
						this.interactive_objects[i].type="plane";			
	
				}
				//ufo
				if (r_num>=this.prob_table[this.cur_prob_line][7] && r_num<this.prob_table[this.cur_prob_line][8])
				{	
					this.interactive_objects[i].start_time=game_tick;	
					this.interactive_objects[i].rotation_speed=0.0;
					this.interactive_objects[i].rotation=0;
					this.interactive_objects[i].x=Math.random()*800;
					this.interactive_objects[i].y=-60;	
					var rand_dir_ang=Math.random()*Math.PI;
					this.interactive_objects[i].visible=true;
					this.interactive_objects[i].dx=Math.cos(rand_dir_ang)/3;
					this.interactive_objects[i].dy=Math.sin(rand_dir_ang)/3;
					this.interactive_objects[i].textures=[game_res.resources["ufo_1_0"].texture,game_res.resources["ufo_1_1"].texture,game_res.resources["ufo_1_2"].texture];
					this.interactive_objects[i].play();
					this.interactive_objects[i].animationSpeed=0.1;
					this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
					this.interactive_objects[i].type="ufo";			
				
				}
				//airship
				if (r_num>=this.prob_table[this.cur_prob_line][8] && r_num<this.prob_table[this.cur_prob_line][9])
				{			
					var r_int=Math.floor(Math.random() * 2)*2-1;
					this.interactive_objects[i].start_time=game_tick;	
					this.interactive_objects[i].rotation_speed=0.0;
					this.interactive_objects[i].rotation=0;
					this.interactive_objects[i].scale.x=r_int;	
					this.interactive_objects[i].x=Math.random()*800;
					this.interactive_objects[i].y=-60;	
					this.interactive_objects[i].dx=-0.1*r_int;
					this.interactive_objects[i].dy=0;
					this.interactive_objects[i].visible=true;
					this.interactive_objects[i].texture=game_res.resources["airship"].texture;
					this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
					this.interactive_objects[i].type="airship";			
			
				}
				//aster
				if (r_num>=this.prob_table[this.cur_prob_line][9] && r_num<this.prob_table[this.cur_prob_line][10])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.05;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-60;	
						
						var rand_dir_ang=Math.random()*Math.PI;					
						this.interactive_objects[i].dx=Math.cos(rand_dir_ang);
						this.interactive_objects[i].dy=Math.sin(rand_dir_ang);
						this.interactive_objects[i].texture=game_res.resources["aster"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;
						this.interactive_objects[i].type="aster";						
					}
				
				
				}
				//sattelite
				if (r_num>=this.prob_table[this.cur_prob_line][10] && r_num<this.prob_table[this.cur_prob_line][11])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].textures=[game_res.resources["satellite_0"].texture,game_res.resources["satellite_1"].texture];
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.05;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="satellite";	
					}
					else
					{	
				
						if (this.eye_y<1300)
							return;
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=900;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].textures=[game_res.resources["satellite_0"].texture,game_res.resources["satellite_1"].texture];
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.05;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="satellite";	
					}
				}
				//helicopter
				if (r_num>=this.prob_table[this.cur_prob_line][11] && r_num<this.prob_table[this.cur_prob_line][12])
				{	
					if (forw_move===true)
					{
						var r_int=Math.floor(Math.random() * 2)*2-1;
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].scale.x=r_int;	
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=-0.1*r_int;
						this.interactive_objects[i].dy=Math.random()/10-0.05;
						this.interactive_objects[i].textures=[game_res.resources["helicopter_0"].texture,game_res.resources["helicopter_1"].texture];
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.1;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="helicopter";	
					}

				}
				//alienrocket
				if (r_num>=this.prob_table[this.cur_prob_line][12] && r_num<this.prob_table[this.cur_prob_line][13])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=-0.1;
						this.interactive_objects[i].textures=[game_res.resources["alienrocket_0"].texture,game_res.resources["alienrocket_1"].texture];
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.2;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="alienrocket";	
					}

				}
				//star_dust
				if (r_num>=this.prob_table[this.cur_prob_line][13] && r_num<this.prob_table[this.cur_prob_line][14])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].texture=game_res.resources["star_dust"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="cloud";	
					}
					else
					{	
				
						if (this.eye_y<1300)
							return;
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=900;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						this.interactive_objects[i].texture=game_res.resources["star_dust"].texture;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="cloud";	
					}
	
				}
				//arrow
				if (r_num>=this.prob_table[this.cur_prob_line][14] && r_num<this.prob_table[this.cur_prob_line][15])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;
						
						this.interactive_objects[i].textures=[game_res.resources["arrow_0"].texture,
						game_res.resources["arrow_1"].texture,
						game_res.resources["arrow_2"].texture,
						game_res.resources["arrow_3"].texture,
						game_res.resources["arrow_4"].texture,
						game_res.resources["arrow_5"].texture,
						game_res.resources["arrow_6"].texture,
						game_res.resources["arrow_7"].texture];						
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.1;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="arrow";	
					}

				}
				//space ship 2
				if (r_num>=this.prob_table[this.cur_prob_line][15] && r_num<this.prob_table[this.cur_prob_line][16])
				{	
					if (forw_move===true)
					{
						this.interactive_objects[i].start_time=game_tick;				
						this.interactive_objects[i].visible=true;
						this.interactive_objects[i].rotation_speed=0.0;
						this.interactive_objects[i].rotation=0;
						this.interactive_objects[i].x=Math.random()*800;
						this.interactive_objects[i].y=-100;
						this.interactive_objects[i].dx=0;
						this.interactive_objects[i].dy=0;						
						this.interactive_objects[i].textures=[game_res.resources["space_ship_2_0"].texture,
						game_res.resources["space_ship_2_1"].texture,game_res.resources["space_ship_2_2"].texture,game_res.resources["space_ship_2_3"].texture];						
						this.interactive_objects[i].play();
						this.interactive_objects[i].animationSpeed=0.25;
						this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
						this.interactive_objects[i].type="space_ship_1";	
					}

				}
				//ufo2
				if (r_num>=this.prob_table[this.cur_prob_line][16] && r_num<this.prob_table[this.cur_prob_line][17])
				{	
					this.interactive_objects[i].start_time=game_tick;	
					this.interactive_objects[i].rotation_speed=0.0;
					this.interactive_objects[i].rotation=0;
					this.interactive_objects[i].x=Math.random()*800;
					this.interactive_objects[i].y=-60;	
					var rand_dir_ang=Math.random()*Math.PI;
					this.interactive_objects[i].visible=true;
					this.interactive_objects[i].dx=Math.cos(rand_dir_ang)/3;
					this.interactive_objects[i].dy=Math.sin(rand_dir_ang)/3;
					this.interactive_objects[i].textures=[game_res.resources["ufo_2_0"].texture,
						game_res.resources["ufo_2_1"].texture];	
					this.interactive_objects[i].play();
					this.interactive_objects[i].animationSpeed=0.1;
					this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
					this.interactive_objects[i].type="ufo";			
				
				}
				//space_ship_3
				if (r_num>=this.prob_table[this.cur_prob_line][17] && r_num<this.prob_table[this.cur_prob_line][18])
				{	
					this.interactive_objects[i].start_time=game_tick;	
					this.interactive_objects[i].rotation_speed=0.0;
					this.interactive_objects[i].rotation=0;
					this.interactive_objects[i].x=Math.random()*800;
					this.interactive_objects[i].y=-60;	
					var rand_dir_ang=Math.random()*Math.PI;
					this.interactive_objects[i].visible=true;
					this.interactive_objects[i].dx=Math.cos(rand_dir_ang)/3;
					this.interactive_objects[i].dy=Math.sin(rand_dir_ang)/3;
					this.interactive_objects[i].textures=[game_res.resources["space_ship_3_0"].texture,
						game_res.resources["space_ship_3_1"].texture];	
					this.interactive_objects[i].play();
					this.interactive_objects[i].animationSpeed=0.5;
					this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
					this.interactive_objects[i].type="ufo";			
				
				}
				//ufo_3
				if (r_num>=this.prob_table[this.cur_prob_line][18] && r_num<this.prob_table[this.cur_prob_line][19])
				{	
					this.interactive_objects[i].start_time=game_tick;	
					this.interactive_objects[i].rotation_speed=0.0;
					this.interactive_objects[i].rotation=0;
					this.interactive_objects[i].x=Math.random()*800;
					this.interactive_objects[i].y=-60;	
					var rand_dir_ang=Math.random()*Math.PI;
					this.interactive_objects[i].visible=true;
					this.interactive_objects[i].dx=Math.cos(rand_dir_ang)/3;
					this.interactive_objects[i].dy=Math.sin(rand_dir_ang)/3;
					this.interactive_objects[i].textures=[game_res.resources["ufo_3_0"].texture,
						game_res.resources["ufo_3_1"].texture];	
					this.interactive_objects[i].play();
					this.interactive_objects[i].animationSpeed=0.5;
					this.interactive_objects[i].radius=this.interactive_objects[i].width/2;					
					this.interactive_objects[i].type="ufo";			
				
				}
				
				
				
				
				
				
				return;
			}
		}		
	}
	
	add_explosion(x,y)
	{
		for (var i=0;i<this.interactive_objects.length;i++)
		{
			if (this.interactive_objects[i].visible===false)
			{
				
				this.interactive_objects[i].stop();
				this.interactive_objects[i].scale.x=1;	

				this.interactive_objects[i].start_time=game_tick;				
				this.interactive_objects[i].visible=true;
				this.interactive_objects[i].rotation_speed=0.0;
				this.interactive_objects[i].rotation=0;
				this.interactive_objects[i].x=x;
				this.interactive_objects[i].y=y;
				this.interactive_objects[i].dx=0;
				this.interactive_objects[i].dy=0;		
				this.interactive_objects[i].textures=this.explosion_textures;		
				this.interactive_objects[i].play();
				this.interactive_objects[i].animationSpeed=0.5;
				this.interactive_objects[i].radius=128;					
				this.interactive_objects[i].type="explosion";	
				
				return;
			}
		}		
	}
		
	process()
	{
		
		var sum_dir_x=rocket.dirx*rocket.force;
		var sum_dir_y=rocket.diry*rocket.force+rocket.gravity_force;
				
		this.eye_y-=sum_dir_y;
		this.eye_x+=sum_dir_x;
		
		if (this.eye_y<0)
			this.eye_y=0;
		
		this.sky_gradient.y=-10000+600+this.eye_y/3;
		
		var next_on_obj_dist=this.program[this.next_forw_obj][7];
		if (this.eye_y>next_on_obj_dist)
		{	
			this.add_object(this.next_forw_obj);
			this.next_forw_obj++;
		}		

		if (this.next_back_obj>=0)
		{
			var back_obj_id=this.back_program[this.next_back_obj];
			var back_on_dist=this.program[back_obj_id][8];
			if (this.eye_y<back_on_dist)
			{
				this.add_object(back_obj_id);
				this.next_back_obj--;
			}			
		}
			
	
		//process low fuel
		this.low_fuel.visible=false;
		if (rocket.fuel<5)
		{
			if (Math.floor(game_tick*6)%2==0)
				this.low_fuel.visible=true;			
		}

		//iterate through all background objects
		for (var o=0;o<this.obj.length;o++)
		{
			for (var i=0;i<this.obj[o].length;i++)
			{			
				if (this.obj[o][i].active)
				{
			
					var top_proj=this.eye_y+300+this.obj[o][i].z_dist*Math.tan(20*Math.PI/180);
					var bottom_proj=this.eye_y-300-this.obj[o][i].z_dist*Math.tan(20*Math.PI/180);
					var left_proj=this.eye_x-400-this.obj[o][i].z_dist*Math.tan(20*Math.PI/180);
					var right_proj=this.eye_x+400+this.obj[o][i].z_dist*Math.tan(20*Math.PI/180);
										
					var obj_h_normilized=(this.obj[o][i].y_pos-bottom_proj)/(top_proj-bottom_proj);
					this.obj[o][i].y=600*(1-obj_h_normilized);

					var obj_x_normilized=(this.obj[o][i].x_pos-left_proj)/(right_proj-left_proj);
					this.obj[o][i].x=800*obj_x_normilized;
					
					if (this.eye_y>this.obj[o][i].off_dist)
					{						
						this.obj[o][i].visible=false;
						this.obj[o][i].active=false;
						this.next_back_obj++;
					}
					
					if (this.eye_y<this.obj[o][i].on_dist)
					{						
						this.obj[o][i].visible=false;
						this.obj[o][i].active=false;
						this.next_forw_obj--;
					}
	
					
					var d=this.obj[o][i].x+this.obj[o][i].width/2;
					if (d<0)
					{
						var projected_x=800+this.obj[o][i].width/2+d;
						var obj_x_normilized=(projected_x/800)*(right_proj-left_proj)+left_proj;
						this.obj[o][i].x_pos=obj_x_normilized;						
					}

					var d=this.obj[o][i].x-this.obj[o][i].width/2-800;
					if (d>0)
					{
						var projected_x=d-this.obj[o][i].width/2;
						var obj_x_normilized=(projected_x/800)*(right_proj-left_proj);
						this.obj[o][i].x_pos=obj_x_normilized+left_proj;						
					}
				
				}	
			}	
		}

		//adding interactive objects
		if (this.eye_y>700)
		{
			if (this.eye_y>this.next_interactive_object_height)
			{			
				this.add_interactive_object(true);
				this.next_interactive_object_height=this.eye_y+this.interactive_object_interval;
			}
			if (this.eye_y<this.next_interactive_object_height-this.interactive_object_interval)
			{		
				this.add_interactive_object(false);
				this.next_interactive_object_height=this.eye_y;
			}
		}

		//process interactive objects
		for (var o=0;o<this.interactive_objects.length;o++)
		{
			if (this.interactive_objects[o].visible===true)
			{
				
				this.interactive_objects[o].x-=sum_dir_x;
				this.interactive_objects[o].y-=sum_dir_y;
				this.interactive_objects[o].rotation+=this.interactive_objects[o].rotation_speed;
				
				this.interactive_objects[o].x+=this.interactive_objects[o].dx*5;
				this.interactive_objects[o].y+=this.interactive_objects[o].dy*5;
				
				if (game_tick>this.interactive_objects[o].start_time+3)
				{					
					if (this.interactive_objects[o].x>200+800+this.interactive_objects[o].width/2)
						this.interactive_objects[o].visible=false;
					
					if (this.interactive_objects[o].x<-this.interactive_objects[o].width/2-200)
						this.interactive_objects[o].visible=false;
					
					if (this.interactive_objects[o].y>200+600+this.interactive_objects[o].height/2)
						this.interactive_objects[o].visible=false;
					
					if (this.interactive_objects[o].y<-this.interactive_objects[o].height/2-200)
						this.interactive_objects[o].visible=false;					
				}
				
				
				//hide finished explosions
				if (this.interactive_objects[o].type==="explosion")
					if (this.interactive_objects[o].currentFrame === (this.interactive_objects[o].totalFrames - 1))
						this.interactive_objects[o].visible=false;	
				
				
				var dx=400-this.interactive_objects[o].x;
				var dy=450-this.interactive_objects[o].y;
				var d=dx*dx+dy*dy;
				d=Math.sqrt(d);
				
				if (d<(this.interactive_objects[o].radius+30))
				{					
					if ( rocket.state!="hit")
					{						
						if (this.interactive_objects[o].type!="arrow" &&
						this.interactive_objects[o].type!="exp" &&
						this.interactive_objects[o].type!="cloud" &&
						this.interactive_objects[o].type!="explosion" &&
						this.interactive_objects[o].type!="fuel")
						{
							this.interactive_objects[o].visible=false;
							this.add_explosion(this.interactive_objects[o].x,this.interactive_objects[o].y);
							if (rocket.state==="fly")
								rocket.set_state("hit");	
						}												
					}

					if (this.interactive_objects[o].type==="fuel")
					{
						this.interactive_objects[o].visible=false;
						rocket.add_fuel(10);
					}

					if (this.interactive_objects[o].type==="exp")
					{
						this.interactive_objects[o].visible=false;
						game.inc_expirience();						
					}
				
					if (this.interactive_objects[o].type==="arrow")
					{
						this.interactive_objects[o].visible=false;
						rocket.add_boost();
					}
				}
			}			
		}
					
		//process probability table data
		if (this.eye_y>this.next_prob_line_height)
		{			
			this.cur_prob_line++;		
			this.next_prob_line_height=this.prob_table[this.cur_prob_line][1];
			this.prv_prob_line_height=this.prob_table[this.cur_prob_line][0];	
		}
		
		if (this.eye_y<this.prv_prob_line_height)
		{			
			this.cur_prob_line--;		
			this.next_prob_line_height=this.prob_table[this.cur_prob_line][1];
			this.prv_prob_line_height=this.prob_table[this.cur_prob_line][0];	
		
		}
		
		if (this.eye_y>50000)
			set_global_state("finish")			
				
				
		//update navigation arrow position
		this.navigation_arrow.x=775;
		this.navigation_arrow.y=580-560*this.eye_y/50000;
		
	}
	
}

class game_class
{   

	constructor()
	{
		
		this.exp_balance=0;	
		
		this.exp_base= new PIXI.Sprite(game_res.resources["exp_base"].texture);	
		this.exp_base.x=20;
		this.exp_base.y=450;
		app.stage.addChild(this.exp_base);
						
		this.exp_balance_text = new PIXI.Text("0", { fontSize: 28, fontFamily: "Tempus Sans ITC", fill: 0xFFFFFF });
		this.exp_balance_text.x=120;
		this.exp_balance_text.y=478;
		app.stage.addChild(this.exp_balance_text);	
		
		this.force_record=0;
		
		
		
		
		this.message_bcg= new PIXI.Sprite(game_res.resources["message_bcg"].texture);	
		this.message_bcg.x=450;
		this.message_bcg.y=570;
		this.message_bcg.anchor.set(0.5,0.5);
		app.stage.addChild(this.message_bcg);
		
		this.message_time=0;
		this.message_text=0;
		this.message_text = new PIXI.Text("0", { fontSize: 20, fontFamily: "Tempus Sans ITC", fill: 0xFFFFFF });
		this.message_text.x=450;
		this.message_text.y=570;
		this.message_text.anchor.set(0.5,0.5);
		app.stage.addChild(this.message_text);	
		
	}

	inc_expirience()
	{
		this.exp_balance++;	
		this.exp_balance_text.text=this.exp_balance;
	}
		
	send_message(text)
	{
		
		this.message_time=game_tick;
		this.message_text.text=text;
		this.message_text.visible=true;
		this.message_bcg.visible=true;
		
	}
	
	draw_and_init()
	{
		rocket.draw_and_init();
		control_panel.draw_and_init();		
		environment.draw_and_init();
		process_func=function(){this.process()}.bind(this);	
		
		this.exp_balance=0;	
		this.exp_balance_text.text="0";
		this.exp_balance_text.visible=true;
	}
	
	process()
	{		
		if (this.message_text.visible)
		{
			if (game_tick>this.message_time+3)
			{
				this.message_text.visible=false;				
				this.message_bcg.visible=false;
			}
		
		}
	
	
		if (rocket.force>this.force_record)
		{
			this.force_record=rocket.force;
			this.send_message("speed record: "+Math.round(this.force_record));			
		}
	
	
		control_panel.process();
		environment.process();
		rocket.process_func();		
		game_tick += 0.01666666;			
	}

}

class final_screen_class
{
	constructor()
	{
		this.big_planet=new PIXI.Sprite(game_res.resources["big_planet"].texture);
		this.big_planet.x=700;
		this.big_planet.y=300;		
		this.big_planet.anchor.set(0.5,0.5);
		app.stage.addChild(this.big_planet);		
		
		this.space_ship=new PIXI.extras.AnimatedSprite([game_res.resources["rocket_11_0"].texture, game_res.resources["rocket_11_1"].texture]);
		this.space_ship.x=100;
		this.space_ship.y=300;		
		this.space_ship.rotation=Math.PI/2;
		this.space_ship.anchor.set(0.5,0.5);
		this.space_ship.gotoAndPlay(0);
		this.space_ship.animationSpeed = 0.4;
		app.stage.addChild(this.space_ship);
		this.start_tick=0;
	}
	
	draw_and_init()
	{		
		process_func=function(){this.process()}.bind(this);	
		this.space_ship.visible=true;
		this.big_planet.visible=true;
		this.space_ship.textures=[game_res.resources["big_rocket_"+upgrade_screen.rocket_id+"_0"].texture, game_res.resources["big_rocket_"+upgrade_screen.rocket_id+"_1"].texture];
		this.space_ship.play();
		this.space_ship.animationSpeed = 0.4;
		this.screen_tick=0;
	}
	
	process()
	{
		this.space_ship.x+=0.3;
		this.big_planet.scale.x+=0.0005;
		this.big_planet.scale.y+=0.0005;
		this.space_ship.scale.x*=0.998;
		this.space_ship.scale.y*=0.998;
		
		this.screen_tick += 0.01666666;
		if (this.screen_tick>180)
			set_global_state("start_screen");
		
	}
}

class instruction_screen_class
{
	constructor()
	{
		this.instructions=new PIXI.Sprite(game_res.resources["instruction"].texture);
		this.instructions.interactive=true;		
		this.instructions.pointerdown=function(){this.pointer_down()}.bind(this);
		app.stage.addChild(this.instructions);		
	}
	
	draw_and_init()
	{		
		this.instructions.visible=true;
	}
	
	pointer_down()
	{	
		if (global_state==="instruction")
			set_global_state("play");			
	}
	
	
}

class upgrade_screen_class
{
	
	constructor()
	{
		
		this.exp_counter=0;
		this.progress_coeff=20;
		this.upgrades_prices=JSON.parse(game_res.resources["upgrades_prices"].data);
				
		this.bcg=new PIXI.Sprite(game_res.resources["upg_scr_bcg"].texture);
		this.bcg.interactive=true;
		this.bcg.pointerdown=function(){this.pointer_down()}.bind(this);
		app.stage.addChild(this.bcg);			
		
		this.rocket_id=0;
		this.rocket = new PIXI.extras.AnimatedSprite([game_res.resources["big_rocket_"+this.rocket_id+"_0"].texture, game_res.resources["big_rocket_"+this.rocket_id+"_1"].texture]);
		this.rocket.x=400;
		this.rocket.y=250;		
		this.rocket.anchor.set(0.5,0.5);
		this.rocket.gotoAndPlay(0);
		this.rocket.animationSpeed = 0.4;
		app.stage.addChild(this.rocket);
		
		this.exp_progress_base=new PIXI.Sprite(game_res.resources["exp_progress_base"].texture);
		this.exp_progress_base.x=25;
		this.exp_progress_base.y=500;
		app.stage.addChild(this.exp_progress_base);				
		
		this.exp_progress=new PIXI.Sprite(game_res.resources["exp_progress"].texture);
		this.exp_progress.x=30;
		this.exp_progress.y=500;
		app.stage.addChild(this.exp_progress);				
		
		this.exp_balance_text = new PIXI.Text("Experience:", { fontSize: 35, fontFamily: "Tempus Sans ITC", fill: 0x000000 });
		this.exp_balance_text.x=250;
		this.exp_balance_text.y=450;
		app.stage.addChild(this.exp_balance_text);		
		
		this.button=new PIXI.Sprite(game_res.resources["press_anything"].texture);
		this.button.x=app.screen.width/2-this.button.width/2;
		this.button.y=550;
		app.stage.addChild(this.button);	
	}
	
	pointer_down()
	{	
		if (this.exp_balance<=0)
			set_global_state("play");	
		
	}
	
	draw_and_init()
	{
		this.bcg.visible=true;
		this.rocket.visible=true;		
		this.exp_balance_text.visible=true;
		process_func=function(){this.process()}.bind(this);	
		
		this.exp_progress_base.visible=true;
		this.exp_progress.visible=true;
		this.exp_progress.scale.x=0;
		
		this.exp_balance_text.text="Experience: "+game.exp_balance;		
		this.exp_balance=game.exp_balance*this.progress_coeff;
		this.exp_progress.scale.x=this.exp_counter/this.upgrades_prices[this.rocket_id]/this.progress_coeff;
		
	}
	
	process()
	{
		
		if (this.exp_balance<=0 || this.rocket_id===13)
		{		
			this.button.visible=true;
			if (l_down || r_down)
				this.pointer_down();			
			return;			
		}
		
		this.exp_counter++;
		this.exp_balance--;
		this.exp_progress.scale.x=this.exp_counter/this.upgrades_prices[this.rocket_id]/this.progress_coeff;
		this.exp_balance_text.text="Experience: "+Math.round(this.exp_balance/this.progress_coeff);
		
		
		var upgrade_price=Math.round(this.upgrades_prices[this.rocket_id]*this.progress_coeff);
		if (this.exp_counter===upgrade_price)
		{				
			this.rocket_id++;
			this.rocket.textures=[game_res.resources["big_rocket_"+this.rocket_id+"_0"].texture, game_res.resources["big_rocket_"+this.rocket_id+"_1"].texture];
			this.rocket.gotoAndPlay(0);
			rocket.rocket.textures=[game_res.resources["rocket_"+this.rocket_id+"_0"].texture, game_res.resources["rocket_"+this.rocket_id+"_1"].texture];
			control_panel.fuel_bar_base.texture=game_res.resources["control_bar_base_"+this.rocket_id].texture;			
			control_panel.shield_bar_base.texture=game_res.resources["control_bar_base_"+this.rocket_id].texture;

			this.exp_progress.scale.x=0;	
			this.exp_counter=0;			
		}	
	}
	
}

class start_screen_screen
{
	constructor()
	{
		this.state="start_screen";
		this.eye_y=0;
		this.planets=[];
		
		this.bcg = new PIXI.Sprite(game_res.resources["start_screen"].texture);
		app.stage.addChild(this.bcg);
		this.bcg.visible=true;		
		
		
		for (var p=0;p<3;p++)
		{
			this.planets.push(new Function());	
			this.planets[p].sprite=new PIXI.Sprite(game_res.resources["planet_"+(p+1)].texture);
			this.planets[p].sprite.anchor.set(0.5,0.5);
			app.stage.addChild(this.planets[p].sprite);		
			
			this.planets[p].spd=Math.random()/10-0.05;
			this.planets[p].sprite.x=Math.random()*850-50;
			this.planets[p].sprite.y=Math.random()*50;
			this.planets[p].tint=0x1111FF;
		}
				
		this.clouds=[];
		for (var c=0;c<3;c++)
		{
			this.clouds.push(new Function());	
			this.clouds[c].sprite=new PIXI.Sprite(game_res.resources["cloud_"+(c+1)].texture);
			this.clouds[c].sprite.anchor.set(0.5,0.5);
			app.stage.addChild(this.clouds[c].sprite);	
			
			this.clouds[c].spd=Math.random()/2-0.1;
			this.clouds[c].sprite.x=Math.random()*850-50;
			this.clouds[c].sprite.y=Math.random()*50+400;
			this.clouds[c].tint=0x1111FF;
		}
		
        this.rocket = new PIXI.extras.AnimatedSprite([game_res.resources["rocket0"].texture, game_res.resources["rocket1"].texture]);
		this.rocket.anchor.set(0.5,0);
		this.rocket.gotoAndPlay(0);
		this.rocket.animationSpeed = 0.4;
		this.rocket.x=250;
		this.rocket.y=100;
		this.rocket.rotation=0.4;
		app.stage.addChild(this.rocket);
		
        this.play_button = new PIXI.Sprite(game_res.resources["play_button"].texture);
		this.play_button.x=450;
		this.play_button.y=350;
		this.play_button.interactive=true;
		this.play_button.buttonMode = true;
        this.play_button.pointerover=function(){this.pointer_over()}.bind(this);
		this.play_button.pointerout=function(){this.pointer_out()}.bind(this);
		this.play_button.pointerdown=function(){this.pointer_down()}.bind(this);
		app.stage.addChild(this.play_button);
	}
	pointer_over()
	{		
		this.play_button.texture = game_res.resources["play_button_h"].texture;		
	}
	pointer_out()
	{		
		this.play_button.texture = game_res.resources["play_button"].texture;		
	}
	pointer_down()
	{		
		set_global_state("instruction");		
	}
	draw_and_init()
	{		
		this.bcg.visible=true;		
		for (var p=0;p<this.planets.length;p++)
		{			
			this.planets[p].spd=Math.random()/10-0.05;
			this.planets[p].sprite.x=Math.random()*850-50;
			this.planets[p].sprite.y=Math.random()*50;
			this.planets[p].sprite.visible=true;
			this.planets[p].tint=0x1111FF;
		}
		
		for (var c=0;c<this.clouds.length;c++)
		{
			this.clouds[c].spd=Math.random()/2-0.1;
			this.clouds[c].sprite.x=Math.random()*850-50;
			this.clouds[c].sprite.y=Math.random()*50+400;
			this.clouds[c].tint=0x1111FF;
			this.clouds[c].sprite.visible=true;
		}
		
		this.play_button.visible=true;
		this.rocket.visible=true;
		process_func=function(){this.process()}.bind(this);	
		
	}
	process()
	{
		
		for (var p=0;p<this.planets.length;p++)
		{
			this.planets[p].sprite.x+=this.planets[p].spd;
			if (this.planets[p].sprite.x>850)
			{
				this.planets[p].spd=Math.random()/10+0.1;
				this.planets[p].sprite.y=Math.random()*50;
				this.planets[p].sprite.x=-50;				
			}			
			if (this.planets[p].sprite.x<-50)
			{
				this.planets[p].sprite.spd=Math.random()/10+0.1;
				this.planets[p].sprite.y=Math.random()*50;
				this.planets[p].sprite.x=850;				
			}	
		}	

		for (var c=0;c<this.clouds.length;c++)
		{
			this.clouds[c].sprite.x+=this.clouds[c].spd;
			if (this.clouds[c].sprite.x>850)
			{
				this.clouds[c].sprite.y=Math.random()*50+400;
				this.clouds[c].sprite.x=-50;				
			}			
			if (this.clouds[c].sprite.x<-50)
			{
				this.clouds[c].sprite.spd=Math.random()/10+0.1;
				this.clouds[c].sprite.y=Math.random()*50+400;
				this.clouds[c].sprite.x=850;				
			}	
		}	

		this.rocket.rotation=0.4+Math.sin(game_tick/5)/10;
		game_tick += 0.01666666;
		
	}
}

function set_global_state(state)
{
	
	//clearing screen
    var stage_size = app.stage.children.length;
    for (var i = 0; i < stage_size; i++)
        app.stage.getChildAt(i).visible = false;
	
	global_state=state;
	switch (global_state)
	{		
		case "start_screen":
		start_screen.draw_and_init();				
		break;
		
		case "play":
		game.draw_and_init();	
		break;
		
		case "upgrade":
		upgrade_screen.draw_and_init();	
		break;
		
		case "instruction":
		instruction_screen.draw_and_init();	
		break;
		
		case "finish":
		final_screen.draw_and_init();	
		break;
		
		case "low_fuel":
		low_fuel_screen.draw_and_init();
		break;
		
		case "destoyed":
		destoyed_screen.draw_and_init();
		break;
		
	}
}

function load()
{

    app = new PIXI.Application(800, 600);
    app.view.style.position = 'absolute';
    app.view.style.left = '50%';
    app.view.style.top = '50%';
    app.view.style.transform = 'translate3d( -50%, -50%, 0 )';
    scrCenX = app.screen.width / 2;
    scrCenY = app.screen.height / 2;
	app.renderer.backgroundColor=0x000000;
		
	game_tick=0;
	
    document.body.appendChild(app.view);
    document.body.style.backgroundColor = "red";

	/*
	kongregateAPI.loadAPI(function(){
	  window.kongregate = kongregateAPI.getAPI();
	  // You can now access the Kongregate API with:
	  // kongregate.services.getUsername(), etc
	  // Proceed with loading your game...
	});
	*/
	
	load_bar_res=new PIXI.loaders.Loader();
    load_bar_res.add("load_bar_frame", "res/load_bar_frame.png");
    load_bar_res.add("load_bar_fill", "res/load_bar_fill.png");
	load_bar_frame = new PIXI.Sprite();
	load_bar_fill = new PIXI.Sprite();
	load_bar_frame.visible=false;
	load_bar_fill.visible=false;
		
	game_res=new PIXI.loaders.Loader();	
	
	game_res.add("start_screen","res/start_screen.png");
	game_res.add("instruction","res/instruction.png");
	game_res.add("upg_scr_bcg","res/upg_scr_bcg.png");
	game_res.add("program", "res/program.txt");
	game_res.add("back_program", "res/back_program.txt");
	game_res.add("prob_table", "res/prob_table.txt");
	game_res.add("rockets_params", "res/rockets_params.txt");
	
	
	game_res.add("upgrades_prices", "res/upgrades_prices.txt");
	
	game_res.add("play_button","res/play_button.png");
	game_res.add("play_button_h","res/play_button_h.png");
	
	game_res.add("rocket0","res/rocket0.png");
	game_res.add("rocket1","res/rocket1.png");
	
	//control bar elements
	for (var i=0;i<14;i++)
		game_res.add("control_bar_base_"+i,"res/bars/back_"+i+".png");
	game_res.add("control_bar_front","res/bars/front.png");
	game_res.add("control_bar_front_2","res/bars/front_2.png");
	
	game_res.add("exp_base","res/exp_base.png");
	
	game_res.add("fuel_icon","res/fuel_icon.png");
	game_res.add("shield_icon","res/shield_icon.png");
	
	game_res.add("cloud_0","res/cloud_0.png");
	game_res.add("cloud_1","res/cloud_1.png");
	game_res.add("cloud_2","res/cloud_2.png");
	game_res.add("cloud_3","res/cloud_3.png");
	game_res.add("cloud_4","res/cloud_4.png");
	game_res.add("cloud_5","res/cloud_5.png");
	game_res.add("cloud_6","res/cloud_6.png");
	game_res.add("belt_0","res/belt_0.png");
	game_res.add("belt_1","res/belt_1.png");
	game_res.add("belt_2","res/belt_2.png");
	
	game_res.add("big_black_hole","res/big_black_hole.png");	
	game_res.add("message_bcg","res/message_bcg.png");	
	game_res.add("saturn","res/saturn.png");	
	game_res.add("satellite_0","res/satellite_0.png");
	game_res.add("satellite_1","res/satellite_1.png");
	
	game_res.add("navigation_arrow","res/navigation_arrow.png");
	game_res.add("progress_panel","res/progress_panel.png");		
	game_res.add("iss","res/iss.png");		
	game_res.add("aster","res/aster.png");
	game_res.add("airship","res/airship.png");
	game_res.add("orb","res/orb.png");
	game_res.add("low_fuel","res/low_fuel.png");
	game_res.add("destroyed_text","res/destroyed_text.png");
	game_res.add("out_of_fuel_text","res/out_of_fuel_text.png");
	
	
	
	game_res.add("helicopter_0","res/helicopter_0.png");
	game_res.add("helicopter_1","res/helicopter_1.png");
		
	game_res.add("alienrocket_0","res/alienrocket_0.png");
	game_res.add("alienrocket_1","res/alienrocket_1.png");
		
	game_res.add("planet_1","res/planet_1.png");
	game_res.add("planet_2","res/planet_2.png");
	game_res.add("planet_3","res/planet_3.png");
	
	game_res.add("star_dust","res/star_dust.png");	
	

		
	game_res.add("plane","res/plane.png");
	
	game_res.add("fuel_can","res/fuel_can.png");
	game_res.add("comet","res/comet.png");
	
	game_res.add("planet_5","res/planet_5.png");
	game_res.add("city","res/city.png");
	game_res.add("mountains","res/mountains.png");
	game_res.add("big_ship","res/big_ship.png");
	game_res.add("big_planet","res/big_planet.png");
	game_res.add("sky_gradient","res/sky_gradient.png");
	game_res.add("exp_progress","res/exp_progress.png");
	game_res.add("exp_progress_base","res/exp_progress_base.png");
	
	for (var r=0;r<14;r++)
	{
		game_res.add("big_rocket_"+r+"_0","res/big_rockets/rocket_"+r+"_0.png");		
		game_res.add("big_rocket_"+r+"_1","res/big_rockets/rocket_"+r+"_1.png");
		game_res.add("rocket_"+r+"_0","res/rockets/rocket_"+r+"_0.png");		
		game_res.add("rocket_"+r+"_1","res/rockets/rocket_"+r+"_1.png");
		game_res.add("rocket_"+r+"_s","res/rockets/rocket_"+r+"_s.png");
	}
	
	
	//load arrow
	for (var r=0;r<8;r++)
		game_res.add("arrow_"+r+"","res/arrow/arrow_"+r+".png");		

	//load experience
	for (var r=0;r<8;r++)
		game_res.add("exp_"+r,"res/exp/exp_"+r+".png");	
	
	//load explosion
	for (var r=0;r<39;r++)
		game_res.add("explosion_"+r,"res/explosion/"+r+".png");	
	
	//load explosion of rocket
	for (var r=0;r<41;r++)
		game_res.add("rocket_expl_"+r,"res/explosion_2/"+r+".png");	
	
	
	//space ship 2
	for (var r=0;r<4;r++)
		game_res.add("space_ship_2_"+r,"res/space_ship_2/"+r+".png");	
	
	for(var i=0;i<3;i++)
		game_res.add("ufo_1_"+i,"res/ufo_1/"+i+".png");
	
	//ufo 2
	for (var r=0;r<2;r++)
		game_res.add("ufo_2_"+r,"res/ufo_2/"+r+".png");	
	
	//space ship 3
	for (var r=0;r<2;r++)
		game_res.add("space_ship_3_"+r,"res/space_ship_3/"+r+".png");	
	
	//ufo 3
	for (var r=0;r<2;r++)
		game_res.add("ufo_3_"+r,"res/ufo_3/"+r+".png");	
	
	game_res.add("ground","res/ground.png");
	game_res.add("press_anything","res/press_anything.png");
	
	load_bar_res.load(load_bar_loaded);

	function load_bar_loaded()
	{		

		load_bar_frame.texture=load_bar_res.resources["load_bar_frame"].texture;
		load_bar_fill.texture=load_bar_res.resources["load_bar_fill"].texture;

		app.stage.addChild(load_bar_frame, load_bar_fill);
		load_bar_frame.x=20;
		load_bar_fill.x=20;
		load_bar_frame.y=280;
		load_bar_fill.y=280;
		load_bar_fill.anchor.set(0);
		game_res.onProgress.add(game_res_loading);	
		game_res.load(game_res_loaded);		
	}
		
    function game_res_loaded()
	{        
		upgrade_screen= new upgrade_screen_class();
		start_screen = new start_screen_screen;
		final_screen = new final_screen_class();
		destoyed_screen = new destoyed_screen_class();
		low_fuel_screen=new low_fuel_screen_class();
		environment=new environment_class();		
		rocket=new rocket_class();
		control_panel= new control_panel_class();		
		instruction_screen= new instruction_screen_class();		
		game=new game_class;
		
		
		set_global_state("start_screen");
				
		window.onkeydown = function (e)
		{
			
			instruction_screen.pointer_down();
			
			switch (e.keyCode)
			{
				
				case 65:
				l_down=true;
				break;
				
				case 68:
				r_down=true;
				break;
				
				case 83:
				rocket.db_down_event();
				d_down=true;
				break;
				
				case 87:
				u_down=true;
				break;
			}
		
		}
		window.onkeyup = function (e)
		{
			
			switch (e.keyCode)
			{
				
				case 65:
				l_down=false;
				break;
				
				case 68:
				r_down=false;
				break;
				
				case 83:
				rocket.db_released_event();
				d_down=false;
				break;
				
				case 87:
				u_down=false;
				break;
			}
		
		};
		
        main_loop();
    }

    function game_res_loading(loader, resource)
	{
		load_bar_frame.visible=true;
		load_bar_fill.visible=true;
		load_bar_fill.width=760*loader.progress/100;
    }
}

function main_loop()
{
    app.ticker.add(function (delta)	{ process_func();});
}
