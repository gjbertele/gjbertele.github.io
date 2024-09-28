import java.lang.*;

class DifferenceArray {

	public static void main(String[] args) {
		//Given a really long array:

		int[] x = new int[100000]; //Create an array with 100,000 elements

		int n = x.length; //Save array length

		for(int i = 0; i<n; i++){
			x[i] = (int)(Math.random() * 1e6); //Fill each element with random integers from 1 to 1,000,000 (1e6 = 10^6)
		}

		int[] differenceArray = makeDifferenceArray(x); //Make a difference array from the normal array


		//To test it:
		for(int i = 0; i<1000; i++){ //1000 times:
			int randomStartIndex = (int)(Math.random() * n); //Choose a random start index
			int randomEndIndex = randomStartIndex+(int)(Math.random() * (n - randomStartIndex)); //Choose a random end index after the random start index
			//Increment everything in between them by 1
			incrementRange(differenceArray, randomStartIndex, randomEndIndex, 1);
		}

		//Return it to a normal array:
		int[] result = makeNormalArray(differenceArray);

		//On average, to increment 1,000 random ranges in the normal array would have taken about 50,000,000 additions.
		//With this, it only takes 2,000 additions


	}
	public static int[] makeDifferenceArray(int[] normalArray){
		int[] differenceArray = new int[normalArray.length]; //Create the difference array

		differenceArray[0] = normalArray[0]; //Make the first element of the difference array the first element of the normal array

		for(int i = 1; i<normalArray.length; i++){
			differenceArray[i] = normalArray[i] - normalArray[i-1];  //Make each element of the difference array the difference of elements in the normal array
		}

		return differenceArray;
	}
	public static void incrementRange(int[] differenceArray, int startIndex, int endIndex, int value){
		differenceArray[startIndex] += value; //increment the startIndexth element by value

		if(endIndex != differenceArray.length - 1){ //if there's an element after the endIndexth element, decrease it by value
			differenceArray[endIndex + 1] -= value;
		}
	}
	public static int[] makeNormalArray(int[] differenceArray){
		int[] normalArray = new int[differenceArray.length]; //Create normal array
		normalArray[0] = differenceArray[0]; //Make it have the same first value as the difference array
		for(int i = 1; i<normalArray.length; i++){
			normalArray[i] = differenceArray[i]+normalArray[i-1]; //Add the difference of the previous element and this element to the previous element to get this element
		}
		return normalArray; //return it
	}
}