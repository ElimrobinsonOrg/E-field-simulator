var charges = [];
var chargeSize = 40;
var snapChargeToGrid = false;

function createCharge(positionX,positionY,mass,velocity)
{
//   var massSlider = document.getElementById("mass");
//   var mass2 = parseInt(massSlider.value);
/*   var magSlider = document.getElementById("magnitude");
  var angSlider = document.getElementById("angle");
  var magnitude = parseInt(magSlider.value);
  var angle = parseInt(angSlider.value);
  //console.log(Xvel);
  //console.log(Yvel);
  var Xvel = magnitude * cos(angle);
  var Yvel = magnitude * sin(angle);
  //console.log(Xvel);
  //console.log(Yvel);
  velocity = createVector(Xvel,Yvel); */
  if (mass == 0)
  {
    let strmass = prompt("Enter mass value","0");
    //console.log(strmass);
    if(isNaN(strmass)|| !strmass){
      mass2 = 0;
    }
    else{
    var mass2 = parseInt(strmass);
    }
    if(mass2>100){
      mass2=100;
    }
    charges.push(new Charge(positionX, positionY,mass2,velocity))
  }
  else
  {
    charges.push(new Charge(positionX, positionY,mass,velocity))
    //charges[charges.length - 1].selected = true;
  }
}

/* function displayCharges()
{
  for (var i = 0; i < charges.length; i++)
  {
    charges[i].display();
    if (charges[i].dragging)
    {
      createDataFromMenu();
    }
  }
} */

function removeCharge(i)
{
  charges[i].selected = false;
  charges[i].slider.style("visibility", "hidden");
  charges[i].slider.remove();

  charges.splice(i,1);

  createDataFromMenu();
}

function removeAllCharges()
{
  var times = charges.length;
  for (var i = times - 1; i >= 0; i--)
  {
    removeCharge(i);
  }
  charges = [];
}

function sliderChanged()
{
  createDataFromMenu();
}

function displayCharges()
{
  //console.log(charges)
  {
    for (var i = 0; i < charges.length; i++)
    {
      if(!pause){
      }
      charges[i].display();
      if (charges[i].dragging)
      {
        createDataFromMenu();
      }
      if(charges[i].moving==true){
      charges[i].move();
      }
      
      let touchingCharge = false;
      for (var a = 0; a < charges.length; a++)
      {
        if(i!=a){
        var distance = p5.Vector.dist(charges[i].position, charges[a].position);
        if (distance - (chargeSize/2) < chargeSize/2 && charges[a].charge != 0)
        {
          touchingCharge = true;
        }
        }
      }
      //console.log(touchingCharge)
      if (touchingCharge)
      {
        charges[i].moving = false;
        charges[i].velocity = createVector(0,0);
        charges[i].acceleration = createVector(0,0);
      }
      else
      {
        charges[i].moving = true;
      }
      }
    for (var i = 0; i < charges.length; i++)
    {
      charges[i].draw();}
    }
  }

function displayGamecharges()
{
  gamecharge.move();
  gamecharge.display();
  gamecharge.checkWallCollision();
} 


class Charge
{
  constructor(x, y, charge, velocity)
  {
    this.x = x;
    this.y = y;
    this.holdx = x;
    this.holdy =y;
    this.holdPosition = createVector(x,y);
    this.position = createVector(x,y);
    this.charge = -1 * charge;
    this.R = 0
    this.selected = false;
    this.dragging = false;
    this.force = null;
    this.slider = createSlider(-250, 0, charge, 1);
    this.velocity = velocity;
    this.acceleration = createVector(0,0);
    this.trail = [this.position];
    this.frames=0;
    this.show = true
    this.chargeDiameter = 5;

    this.slider.style("zIndex", "999");
    this.slider.style("visibility", "hidden");
    this.slider.addClass("slider");
    this.slider.input(sliderChanged);
    this.slider.changed(sliderChanged);

    this.display = function()
    {
      if (this.selected)
      {
        this.dragging=true;
        //this.slider.position(this.x - 75, this.y + (chargeSize/2) + 10, "fixed");
        //this.charge = this.slider.value();
      }


      push();

      //Show slider if hovered by mouse or hide slider
      if (this.selected)
      {
        stroke(255);
        this.slider.style("visibility", "visible");
      }
      else
      {
        stroke(color(0,0,0,255/2));
        this.slider.style("visibility", "hidden");
      }

      //Create adaptive color
      this.R = this.charge/50*-1+.5

      //Set Color - or set to gray if 0
      if (this.charge == 0){
        fill("rgba(80,80,80, 1)");
      }
      else{
        fill("rgba(255,165,0,"+ this.R + ")");
      }

      ellipse(this.x, this.y, chargeSize, chargeSize);
      textSize(16);
      fill("#ffffff");
      noStroke();

      if (this.charge == 0)
      {
        text(this.charge, this.x - ((this.charge.toString().length + 1.5) * 4)+6, this.y + 7);
      }
      else
      {
        //text(this.charge, this.x - ((this.charge.toString().length) * 4), this.y + 7);
        text(this.charge*-1, this.x - ((this.charge.toString().length) * 4)+4, this.y + 7);
      }

      //Display trail
      if(trails==true){
        pop();
        push();
        noStroke();
        
        //console.log(this.trail.length);
        for (var i = 0; i < this.trail.length; i++){
          fill("rgb(255,165,0)");
          var posx = this.trail[i].x
          var posy = this.trail[i].y
          ellipse(posx, posy, 3, 3);
        }
        pop();
    }
    }
    this.draw = function()
    {
      //Update actual positions
      this.position = this.holdPosition
      this.x = this.position.x
      this.y = this.position.y

      //Draw Trails
        this.frames++;
        if (this.frames > 10)
        {
          this.trail.push(createVector(this.position.x, this.position.y));
          this.frames = 0;
        }
      }

    this.move = function()
    {
      for(var i=0;i<500;i++){
        if(!pause){
          var force = netForceAtPoint(this.holdPosition);
          if (force.mag() != Infinity){
            //Scaling Factor (Arbitrary?)
            //console.log(force);
            force = force.mult(.0016);
            console.log(force);
            var timeStep = .005;
          
            //Euler's Method
        
            this.acceleration = force;
            var at = this.acceleration.mult(timeStep);
            this.velocity.add(at);
            //create dummy variable so we do not actually change velocity
            //Best way
            this.holdPosition.add(velocity.mult(timeStep));
            //dividing by the timestep to adjust after multiplying
            velocity.div(timeStep);

            //Runge Kutta Method
            //var a1 = 
          }
        }
      }
    }

    this.checkWallCollision = function()
    {
      for (var i = 0; i < walls.length; i++)
      {
        if (collideRectCircle(walls[i].x, walls[i].y, walls[i].width * gridSize, walls[i].height * gridSize, this.position.x, this.position.y, chargeDiameter))
        {
          this.velocity = createVector(0, 0);
        }
      }
    }
}
}
