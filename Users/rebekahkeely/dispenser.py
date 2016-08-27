print """	Welcome to the vending machine change maker program
		Change maker initialized.
		Stock contains:
  		 25 nickels
  		 25 dimes
  		 25 quarters
  		 0 ones
  		 0 fives"""

##how to keep asking denominations after each input?
	##make new function?; if new function, how to recall prices from first function?
def denominations(value):

	priceHundred = value

	##what is difference between input and raw_input?
	depositString = str(raw_input("Indicate your deposit: "))

	if depositString == "n":
		priceHundred = priceHundred - 5
	elif depositString == "d":
		priceHundred = priceHundred - 10
	elif depositString == "q":
		priceHundred = priceHundred - 25
	elif depositString == "o":
		priceHundred = priceHundred - 100
	elif depositString == "f":
		priceHundred = priceHundred - 500
	else:
		print "Illegal selection:", depositString

	print "Payment due:", (priceHundred) / 100
	
	if priceHundred > 0:
		denominations(priceHundred)

def firstMenu():
	priceString = str(input("Enter the purchase price (xx.xx) or `q' to quit: "))
	priceFloat = float(priceString)
	priceHundred = priceFloat * 100

	##how to stop if first condition is met?
	if priceFloat > 10.00:
		print "Insuficient funds at vending machine. Please reduce your purchase price."

	##add conditional to require two decimal places
	##priceString.split[1] does not print multiple digits if divisible by 0.10
	if priceHundred % 5 == 0:
		print """	Menu for deposits:
		'n' - deposit a nickel
		'd' - deposit a dime
		'q' - deposit a quarter
		'o' - deposit a one dollar bill
		'f' - deposit a five dollar bill
		'c' - cancel the purchase
		Payment due:""", priceString.split(".")[0], "dollar(s) and", priceString.split(".")[1], "cents"
	else:
		print "Illegal price: Must be a non-negative multiple of 5 cents."
		print firstMenu()

	denominations(priceHundred)

firstMenu()
